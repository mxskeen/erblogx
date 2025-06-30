import os
import feedparser
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv
import xml.etree.ElementTree as ET

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON = os.getenv("SUPABASE_ANON")


supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON)



def clean_text(text: str) -> str:
    """
    Removes the null character '\u0000' from a string.
    Returns an empty string if the input is not a string.
    """
    if not isinstance(text, str):
        return ""
    return text.replace('\u0000', '')

def get_feed_urls_from_opml(opml_file_path: str) -> list:
    """Parses an OPML file and returns a list of feed URLs."""
    print("Parsing OPML file to get feed URLs...")
    try:
        tree = ET.parse('blogs.opml')
        root = tree.getroot()
        feed_urls = [outline.attrib['xmlUrl'] for outline in root.findall('.//outline[@xmlUrl]')]
        print(f"Found {len(feed_urls)} feed URLs.")
        return feed_urls
    except FileNotFoundError:
        print(f"ERROR: OPML file not found at '{opml_file_path}'. Please make sure it's in the /backend folder.")
        return []

def get_full_article_content(url: str) -> str:
    """
    Fetches and scrapes the full article content from a URL.
    This is a fallback for when the RSS feed summary is too short.
    """
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status() # Raise an exception for bad status codes
        soup = BeautifulSoup(response.content, 'html.parser')
        
        main_content = (soup.find('article') or 
                        soup.find('div', class_='post-content') or 
                        soup.find('div', class_='entry-content') or
                        soup.find('main'))
                        
        if main_content:
            for script_or_style in main_content(['script', 'style']):
                script_or_style.decompose()
            return clean_text(main_content.get_text(separator='\n', strip=True))
        return ""
    except requests.RequestException as e:
        print(f"    --> Could not scrape {url}. Error: {e}")
        return ""


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
                    continue # Skip entries without a link

                # 1. Check if article already exists in the database
                res = supabase.table('articles').select('id').eq('url', entry_link).execute()
                if res.data:
                    continue

                # 2. Structure the data, cleaning every text field
                summary = entry.get("summary", "")
                article = {
                    "title": clean_text(entry.get("title", "No Title Found")),
                    "url": entry_link,
                    "published_date": entry.get("published", None),
                    "summary": clean_text(summary),
                    "company": clean_text(feed.feed.get("title", ""))
                }
                
                # 3. Decide if we need to scrape for full content
                if len(summary) < 200:
                    print(f"  -> Summary short, scraping full content for: {article['title']}")
                    full_content = get_full_article_content(article["url"])
                    article["content"] = full_content if full_content else clean_text(summary)
                else:
                    article["content"] = clean_text(summary)
                
                articles_to_save.append(article)


            if articles_to_save:
                print(f"  --> Found {len(articles_to_save)} new articles. Saving to Supabase...")
                supabase.table('articles').insert(articles_to_save, returning="minimal").execute()
            else:
                print("  -> No new articles found for this feed.")

        except Exception as e:
            print(f"  !!!!!! FAILED to process feed {feed_url}. Error: {e} !!!!!!")
            continue 

if __name__ == "__main__":
    main()