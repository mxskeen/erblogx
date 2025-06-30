import feedparser
import os 
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON = os.getenv("SUPABASE_ANON")

supabase:Client=create_client(SUPABASE_URL,SUPABASE_ANON)

feed_url = "https://www.serverless.com/blog/rss.xml"

feed = feedparser.parse(feed_url)

articles_to_save = []

# Loop through and collect all the articles SAFELY
for entry in feed.entries:
    # Use .get() to provide a default value if a key is missing
    article = {
        "title": entry.get("title", "No Title Found"), # Use default if 'title' is missing
        "url": entry.get("link", ""),
        "published_date": entry.get("published", None),
        "summary": entry.get("summary", "")
    }
    articles_to_save.append(article)

# Now, this print statement will always work because the loop won't crash
print(f"Found {len(articles_to_save)} articles from '{feed.feed.title}'.")

supabase.table('articles').insert(articles_to_save).execute()