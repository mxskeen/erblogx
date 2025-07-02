import os
import torch
from sentence_transformers import SentenceTransformer
import feedparser
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv
import xml.etree.ElementTree as ET
import trafilatura

# --- SETUP ---
# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON = os.getenv("SUPABASE_ANON")
if not SUPABASE_URL or not SUPABASE_ANON:
    raise Exception("Supabase credentials not found.")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON)

#sentence transformer
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")
embedding_model = SentenceTransformer('all-mpnet-base-v2', device=device)

# --- HELPER FUNCTIONS ---

def clean_text(text: str) -> str:
    """Removes the null character '\u0000' from a string."""
    if not isinstance(text, str):
        return ""
    return text.replace('\u0000', '')

def get_feed_urls_from_opml(opml_file_path: str) -> list:
    """Parses an OPML file and returns a list of feed URLs."""
    print("Parsing OPML file to get feed URLs...")
    try:
        tree = ET.parse(opml_file_path)
        root = tree.getroot()
        feed_urls = [outline.attrib['xmlUrl'] for outline in root.findall('.//outline[@xmlUrl]')]
        print(f"Found {len(feed_urls)} feed URLs.")
        return feed_urls
    except FileNotFoundError:
        print(f"ERROR: OPML file not found at '{opml_file_path}'.")
        return []

def get_full_article_content(url: str) -> str:
    """Attempts to get full text via trafilatura, then falls back to basic BeautifulSoup scrape."""
    try:
        downloaded = trafilatura.fetch_url(url)
        full = trafilatura.extract(downloaded)
        if full:
            return clean_text(full)
    except Exception:
        pass

    # fallback
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        main_content = (soup.find('article') or soup.find('div', class_='post-content') or soup.find('main'))
        if main_content:
            for s in main_content(['script', 'style']):
                s.decompose()
            return clean_text(main_content.get_text(separator='\n', strip=True))
    except requests.RequestException:
        pass
    return ""

# --- MAIN EXECUTION ---
def main():
    """Main function to run the ingestion pipeline."""
    opml_path = 'blogs.opml'
    all_feed_urls = get_feed_urls_from_opml(opml_path)

    if not all_feed_urls:
        print("No feed URLs found. Exiting.")
        return

    for feed_url in all_feed_urls:
        print(f"\n--- Processing feed: {feed_url} ---")
        try:
            feed = feedparser.parse(feed_url)
            articles_to_save = []

            for entry in feed.entries:
                entry_link = entry.get("link", "")
                if not entry_link:
                    continue

                res = supabase.table('articles').select('id').eq('url', entry_link).execute()
                if res.data:
                    continue

                summary = entry.get("summary", "")
                content = ""
                if len(summary) < 200:
                    full_content = get_full_article_content(entry_link)
                    content = full_content if full_content else clean_text(summary)
                else:
                    content = clean_text(summary)
                
                if not content:
                    print(f"  -> Skipping article with no content: {entry.get('title', '')}")
                    continue

                embedding = embedding_model.encode(content[:4000]).tolist()

                article = {
                    "title": clean_text(entry.get("title", "No Title Found")),
                    "url": entry_link,
                    "published_date": entry.get("published", None),
                    "company": clean_text(feed.feed.get("title", "")),
                    "content": content,
                    "embedding": embedding 
                }
                
                articles_to_save.append(article)
            
            if articles_to_save:
                print(f"  --> Found {len(articles_to_save)} new articles. Saving to Supabase...")
                supabase.table('articles').insert(articles_to_save, returning="minimal").execute()
            else:
                print("  -> No new articles found for this feed.")

        except Exception as e:
            print(f"  !!!!!! FAILED to process feed {feed_url}. Error: {e} !!!!!!")
            continue

    # --- HACKER NEWS SCRAPING ---
    print("\n--- Processing latest 500 Hacker News stories ---")
    try:
        HN_API_BASE = "https://hacker-news.firebaseio.com/v0"

        latest_ids = requests.get(f"{HN_API_BASE}/newstories.json", timeout=10).json()[:500]
        if not latest_ids:
            print("Could not fetch newstories list. Aborting HN scrape.")
            return

        print(f"Retrieved {len(latest_ids)} story IDs.")

        hn_batch = []
        for item_id in latest_ids:
            try:
                data = requests.get(f"{HN_API_BASE}/item/{item_id}.json", timeout=10).json()
                if not data or data.get("type") != "story" or data.get("deleted") or not data.get("url"):
                    continue

                url = data["url"]
                if supabase.table('articles').select('id').eq('url', url).execute().data:
                    continue

                title = clean_text(data.get("title", ""))
                content = get_full_article_content(url) or title

                embedding = embedding_model.encode(content[:4000]).tolist()

                published_ts = data.get("time")
                from datetime import datetime, timezone
                published_dt = datetime.fromtimestamp(published_ts, tz=timezone.utc).isoformat()

                hn_batch.append({
                    "title": title,
                    "url": url,
                    "published_date": published_dt,
                    "company": "Hacker News",
                    "content": content,
                    "embedding": embedding
                })

                if len(hn_batch) >= 100:
                    supabase.table('articles').insert(hn_batch, returning="minimal").execute()
                    hn_batch = []

            except Exception:
                continue

        if hn_batch:
            supabase.table('articles').insert(hn_batch, returning="minimal").execute()
    except Exception as e:
        print(f"HN scraping failed: {e}")

if __name__ == "__main__":
    main()