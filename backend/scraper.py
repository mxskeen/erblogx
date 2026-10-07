import os
import sys
import time
import argparse
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

import requests
import feedparser
from bs4 import BeautifulSoup
import trafilatura
from dotenv import load_dotenv
import torch
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client

# --- SETUP & CONFIGURATION ---
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON = os.getenv("SUPABASE_ANON")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or SUPABASE_ANON

DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36 (ErBlogX-Bot/1.0; +https://erblogx.vercel.app)"
)

REQUEST_TIMEOUT = 8  # Strict 8s timeout to prevent dead blogs from blocking the pipeline
MAX_FEED_WORKERS = 20
MAX_CONTENT_WORKERS = 15
BATCH_EMBED_SIZE = 32
BATCH_DB_SIZE = 100

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"[{datetime.now().isoformat()}] Scraper device initialized: {device}")

# --- HELPER FUNCTIONS ---

def clean_text(text: Optional[str]) -> str:
    """Removes null characters, excessive whitespace, and common artifacts."""
    if not text or not isinstance(text, str):
        return ""
    text = text.replace("\u0000", "")
    return " ".join(text.split())

def parse_opml(opml_path: str) -> List[Dict[str, str]]:
    """Extracts feed metadata (company name, XML URL, HTML URL) from an OPML file."""
    if not os.path.exists(opml_path):
        print(f"Warning: OPML file not found at {opml_path}")
        return []

    feeds = []
    try:
        tree = ET.parse(opml_path)
        root = tree.getroot()
        for outline in root.findall(".//outline[@xmlUrl]"):
            xml_url = outline.attrib.get("xmlUrl", "").strip()
            if not xml_url:
                continue
            company = (
                outline.attrib.get("title")
                or outline.attrib.get("text")
                or "Engineering Blog"
            ).strip()
            html_url = outline.attrib.get("htmlUrl", "").strip()
            feeds.append({
                "company": company,
                "xml_url": xml_url,
                "html_url": html_url,
            })
    except Exception as e:
        print(f"Error parsing OPML file: {e}")
    return feeds

def fetch_feed_entries(feed_info: Dict[str, str]) -> List[Dict[str, Any]]:
    """Fetches and parses a single RSS/Atom feed with a strict timeout."""
    company = feed_info["company"]
    url = feed_info["xml_url"]
    entries = []

    try:
        resp = requests.get(
            url,
            headers={"User-Agent": DEFAULT_USER_AGENT},
            timeout=REQUEST_TIMEOUT,
        )
        if resp.status_code != 200:
            return []

        parsed = feedparser.parse(resp.content)
        feed_title = clean_text(parsed.feed.get("title", "")) or company

        for entry in parsed.entries:
            link = entry.get("link", "").strip()
            if not link or not link.startswith("http"):
                continue

            title = clean_text(entry.get("title", "")) or "Untitled Dispatch"
            summary = clean_text(entry.get("summary", "") or entry.get("description", ""))

            # Handle published date
            published = entry.get("published", None) or entry.get("updated", None)
            if not published and entry.get("published_parsed"):
                try:
                    published = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc).isoformat()
                except Exception:
                    published = datetime.now(timezone.utc).isoformat()

            entries.append({
                "title": title,
                "url": link,
                "company": company or feed_title,
                "summary": summary,
                "published_date": published or datetime.now(timezone.utc).isoformat(),
            })
    except Exception:
        # Feeds can be down, rate-limited, or moved — fail fast and move on
        pass

    return entries

def extract_article_content(url: str, fallback_summary: str = "") -> str:
    """Extracts clean full text from an article URL using trafilatura, falling back to BeautifulSoup."""
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            extracted = trafilatura.extract(
                downloaded,
                include_comments=False,
                include_tables=False,
                no_fallback=False,
            )
            if extracted and len(extracted) > 150:
                return clean_text(extracted)
    except Exception:
        pass

    # Secondary fallback using BeautifulSoup
    try:
        resp = requests.get(
            url,
            headers={"User-Agent": DEFAULT_USER_AGENT},
            timeout=REQUEST_TIMEOUT,
        )
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.content, "html.parser")
            main = (
                soup.find("article")
                or soup.find("main")
                or soup.find("div", class_="post-content")
                or soup.find("div", class_="article-content")
            )
            if main:
                for tag in main(["script", "style", "nav", "header", "footer"]):
                    tag.decompose()
                text = main.get_text(separator="\n", strip=True)
                if len(text) > 150:
                    return clean_text(text)
    except Exception:
        pass

    return clean_text(fallback_summary)

def fetch_hacker_news_stories(limit: int = 100) -> List[Dict[str, Any]]:
    """Fetches high-signal top tech stories from Hacker News."""
    print(f"[{datetime.now().isoformat()}] Fetching top Hacker News engineering stories...")
    stories = []
    base_url = "https://hacker-news.firebaseio.com/v0"

    try:
        top_ids = requests.get(f"{base_url}/topstories.json", timeout=8).json()[:limit]
        if not top_ids:
            return []

        def fetch_hn_item(item_id: int):
            try:
                item = requests.get(f"{base_url}/item/{item_id}.json", timeout=5).json()
                if (
                    item
                    and item.get("type") == "story"
                    and item.get("url")
                    and item.get("url").startswith("http")
                    and not item.get("deleted")
                    and item.get("score", 0) >= 15  # Minimum score threshold for signal
                ):
                    url = item["url"]
                    # Ignore blacklisted non-article sites
                    blacklisted = ("youtube.com", "youtu.be", "twitter.com", "x.com", "reddit.com")
                    if any(b in url.lower() for b in blacklisted):
                        return None

                    ts = item.get("time")
                    published = (
                        datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()
                        if ts
                        else datetime.now(timezone.utc).isoformat()
                    )
                    return {
                        "title": clean_text(item.get("title", "")),
                        "url": url,
                        "company": "Hacker News",
                        "summary": f"Discussion on Hacker News with {item.get('score', 0)} points and {item.get('descendants', 0)} comments.",
                        "published_date": published,
                    }
            except Exception:
                return None

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(fetch_hn_item, i) for i in top_ids]
            for f in as_completed(futures):
                res = f.result()
                if res:
                    stories.append(res)
    except Exception as e:
        print(f"Warning: Hacker News scrape failed: {e}")

    print(f"[{datetime.now().isoformat()}] Retrieved {len(stories)} candidate stories from Hacker News.")
    return stories

def fetch_lobsters_stories(limit: int = 50) -> List[Dict[str, Any]]:
    """Fetches high-signal engineering stories from Lobste.rs."""
    print(f"[{datetime.now().isoformat()}] Fetching Lobste.rs hottest stories...")
    stories = []
    try:
        resp = requests.get(
            "https://lobste.rs/hottest.json",
            headers={"User-Agent": DEFAULT_USER_AGENT},
            timeout=8,
        )
        if resp.status_code == 200:
            for item in resp.json()[:limit]:
                url = item.get("url")
                if not url or not url.startswith("http"):
                    continue
                # Exclude internal lobste.rs discussion links without external blog URL
                if "lobste.rs" in url:
                    continue

                stories.append({
                    "title": clean_text(item.get("title", "")),
                    "url": url,
                    "company": "Lobsters",
                    "summary": f"Technical discussion on Lobste.rs with {item.get('score', 0)} score.",
                    "published_date": item.get("created_at") or datetime.now(timezone.utc).isoformat(),
                })
    except Exception as e:
        print(f"Warning: Lobste.rs scrape failed: {e}")

    print(f"[{datetime.now().isoformat()}] Retrieved {len(stories)} candidate stories from Lobste.rs.")
    return stories

def filter_existing_urls(supabase: Client, candidate_urls: List[str]) -> set:
    """Queries Supabase in batches of 200 to find existing URLs and returns a set of known URLs."""
    existing_urls = set()
    batch_size = 200

    for i in range(0, len(candidate_urls), batch_size):
        chunk = candidate_urls[i : i + batch_size]
        try:
            resp = supabase.table("articles").select("url").in_("url", chunk).execute()
            if resp.data:
                for row in resp.data:
                    if row.get("url"):
                        existing_urls.add(row["url"])
        except Exception as e:
            print(f"Error querying existing URLs batch {i}-{i+len(chunk)}: {e}")
            time.sleep(0.5)

    return existing_urls

# --- MAIN INGESTION PIPELINE ---

def run_scraper(
    opml_path: str = "blogs.opml",
    limit_feeds: Optional[int] = None,
    dry_run: bool = False,
    include_hn: bool = True,
    include_lobsters: bool = True,
):
    start_time = time.time()
    print("=" * 60)
    print(f"ErBlogX Automated Scraper Pipeline starting at {datetime.now(timezone.utc).isoformat()}")
    print("=" * 60)

    # Initialize Supabase
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_ANON/SUPABASE_SERVICE_ROLE_KEY environment variables.")
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Connected to Supabase.")

    # 1. Parse Feeds from OPML
    feeds = parse_opml(opml_path)
    if not feeds:
        # Fallback to backend/blogs.opml if running from repo root
        alt_path = os.path.join(os.path.dirname(__file__), "blogs.opml")
        feeds = parse_opml(alt_path)

    if limit_feeds and limit_feeds > 0:
        feeds = feeds[:limit_feeds]
    print(f"Found {len(feeds)} engineering blog feeds to check.")

    # 2. Concurrently fetch feed entries
    all_candidates: List[Dict[str, Any]] = []
    print(f"\n[{datetime.now().isoformat()}] Concurrently fetching RSS/Atom feeds (workers={MAX_FEED_WORKERS})...")

    with ThreadPoolExecutor(max_workers=MAX_FEED_WORKERS) as executor:
        futures = {executor.submit(fetch_feed_entries, f): f for f in feeds}
        for f in as_completed(futures):
            entries = f.result()
            if entries:
                all_candidates.extend(entries)

    print(f"Collected {len(all_candidates)} total candidate articles across OPML feeds.")

    # 3. Add Hacker News & Lobsters
    if include_hn:
        hn_items = fetch_hacker_news_stories(limit=100)
        all_candidates.extend(hn_items)

    if include_lobsters:
        lobsters_items = fetch_lobsters_stories(limit=50)
        all_candidates.extend(lobsters_items)

    # Deduplicate candidate list in memory by URL
    seen_urls = set()
    unique_candidates: List[Dict[str, Any]] = []
    for item in all_candidates:
        u = item["url"]
        if u not in seen_urls:
            seen_urls.add(u)
            unique_candidates.append(item)

    print(f"\n[{datetime.now().isoformat()}] Total unique candidates: {len(unique_candidates)}")

    # 4. Check which URLs are already in Supabase
    candidate_urls = [c["url"] for c in unique_candidates]
    print(f"Checking database for existing articles in batches...")
    existing_urls = filter_existing_urls(supabase, candidate_urls)
    print(f"Found {len(existing_urls)} articles already indexed in the database.")

    new_articles = [c for c in unique_candidates if c["url"] not in existing_urls]
    print(f"\n>>> Discovered {len(new_articles)} BRAND NEW articles to scrape and index! <<<")

    if not new_articles:
        print("Database index is already fully up-to-date. No new articles to insert.")
        return

    if dry_run:
        print(f"Dry-run mode enabled: Skipping full-text extraction and DB insertion. Discovered {len(new_articles)} new items.")
        return

    # 5. Concurrently extract full text content for new articles
    print(f"\n[{datetime.now().isoformat()}] Extracting full article text (workers={MAX_CONTENT_WORKERS})...")
    articles_with_content = []

    def process_content(article: Dict[str, Any]):
        content = extract_article_content(article["url"], fallback_summary=article.get("summary", ""))
        if content and len(content) >= 100:
            article["content"] = content
            return article
        return None

    with ThreadPoolExecutor(max_workers=MAX_CONTENT_WORKERS) as executor:
        futures = [executor.submit(process_content, a) for a in new_articles]
        for f in as_completed(futures):
            res = f.result()
            if res:
                articles_with_content.append(res)

    print(f"Successfully extracted text for {len(articles_with_content)} articles.")

    if not articles_with_content:
        print("No articles with valid content found.")
        return

    # 6. Load SentenceTransformer and batch encode embeddings
    print(f"\n[{datetime.now().isoformat()}] Loading SentenceTransformer model ('all-mpnet-base-v2')...")
    model = SentenceTransformer("all-mpnet-base-v2", device=device)

    print(f"Generating vector embeddings in batches of {BATCH_EMBED_SIZE}...")
    texts_to_embed = [
        f"{a['title']} - {a['content'][:3000]}" for a in articles_with_content
    ]

    all_embeddings = model.encode(
        texts_to_embed,
        batch_size=BATCH_EMBED_SIZE,
        show_progress_bar=True,
        normalize_embeddings=True,
    ).tolist()

    for i, a in enumerate(articles_with_content):
        a["embedding"] = all_embeddings[i]

    # 7. Insert into Supabase in batches
    print(f"\n[{datetime.now().isoformat()}] Inserting {len(articles_with_content)} articles into Supabase...")
    inserted_count = 0

    for i in range(0, len(articles_with_content), BATCH_DB_SIZE):
        batch = articles_with_content[i : i + BATCH_DB_SIZE]
        db_payload = [
            {
                "title": a["title"][:500],
                "url": a["url"][:1000],
                "published_date": a["published_date"],
                "company": a["company"][:200],
                "content": a["content"],
                "embedding": a["embedding"],
            }
            for a in batch
        ]

        try:
            supabase.table("articles").insert(db_payload, returning="minimal").execute()
            inserted_count += len(batch)
            print(f"  -> Inserted {inserted_count}/{len(articles_with_content)} articles into DB...")
        except Exception as e:
            print(f"Error inserting batch {i}-{i+len(batch)}: {e}")

    elapsed = round(time.time() - start_time, 2)
    print("\n" + "=" * 60)
    print(f"Scraper Run Complete!")
    print(f"Articles inserted into index: {inserted_count}")
    print(f"Total pipeline elapsed time: {elapsed}s ({round(elapsed / 60, 2)} minutes)")
    print("=" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ErBlogX Automated Scraper Pipeline")
    parser.add_argument("--opml", default="blogs.opml", help="Path to OPML file")
    parser.add_argument("--limit-feeds", type=int, default=None, help="Limit number of feeds to check (for testing)")
    parser.add_argument("--dry-run", action="store_true", help="Discover articles without scraping full text or saving to DB")
    parser.add_argument("--no-hn", action="store_true", help="Skip Hacker News")
    parser.add_argument("--no-lobsters", action="store_true", help="Skip Lobste.rs")

    args = parser.parse_args()

    run_scraper(
        opml_path=args.opml,
        limit_feeds=args.limit_feeds,
        dry_run=args.dry_run,
        include_hn=not args.no_hn,
        include_lobsters=not args.no_lobsters,
    )