import os
import requests
import time
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

# --- SETUP ---
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON = os.getenv("SUPABASE_ANON")

if not SUPABASE_URL or not SUPABASE_ANON:
    raise Exception("Supabase credentials not found.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON)


HN_API_BASE = "https://hacker-news.firebaseio.com/v0"


def scrape_hacker_news():
    print("Fetching max item ID from Hacker News...")
    try:
        max_item_id = requests.get(f"{HN_API_BASE}/maxitem.json").json()
        print(f"Max item ID is {max_item_id}.")
    except requests.RequestException as e:
        print(f"Could not fetch max item ID. Error: {e}")
        return

    articles_to_save = []
    batch_size = 100


    # Loop backwards from the max ID
    for item_id in range(max_item_id, 0, -1):
        try:
            # 1. Fetch item details FIRST
            item_res = requests.get(f"{HN_API_BASE}/item/{item_id}.json")
            item_res.raise_for_status()
            item_data = item_res.json()
            
            # 2. Filter for valid stories that have a URL
            if (item_data and 
                item_data.get("type") == "story" and 
                not item_data.get("deleted", False) and 
                item_data.get("url")):
                
                external_url = item_data.get("url")

                # 3. Perform the CORRECT duplicate check against the external URL
                res = supabase.table('articles').select('id').eq('url', external_url).execute()
                if res.data:
                    print(f"  -> URL already exists, skipping item {item_id}: {external_url}")
                    continue # This will now correctly skip to the next item

                # 4. If it's a new article, prepare it for saving
                published_ts = item_data.get("time")
                published_dt = datetime.fromtimestamp(published_ts, tz=timezone.utc)

                article = {
                    "title": item_data.get("title"),
                    "url": external_url,
                    "published_date": published_dt.isoformat(),
                    "company": "Hacker News",
                    "content": item_data.get("title"),
                    "summary": f"A story submitted by user {item_data.get('by')}."
                }
                
                articles_to_save.append(article)
                print(f"Found story: {item_id} - {article['title']}")

            # Insert batch into Supabase when it reaches the desired size
            if len(articles_to_save) >= batch_size:
                print(f"\n--- Saving a batch of {len(articles_to_save)} articles... ---\n")
                supabase.table('articles').insert(articles_to_save).execute()
                articles_to_save = [] # Reset the batch

            # Be respectful to the API


        except Exception as e:
            print(f"Could not process item {item_id}. Error: {e}")
            continue
    
    # Save any remaining articles in the last batch
    if articles_to_save:
        print(f"\n--- Saving the final batch of {len(articles_to_save)} articles... ---\n")
        supabase.table('articles').insert(articles_to_save).execute()

if __name__ == "__main__":
    scrape_hacker_news()