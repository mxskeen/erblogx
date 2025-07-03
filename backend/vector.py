import os
import trafilatura
from supabase import create_client, Client
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import torch
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON = os.getenv("SUPABASE_ANON")
supabase:Client=create_client(SUPABASE_URL,SUPABASE_ANON)

# Device / model setup
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Vector generator using device: {device}")
model = SentenceTransformer('all-mpnet-base-v2', device=device)

# Existing batch embedding function
def generate_and_update_embeddings(batch_size: int = 20):
    """Generate embeddings for articles that already have content but no embedding."""

    while True:
        print(f"\nFetching a batch of {batch_size} articles missing embeddings...")

        # Supabase Python client doesn't yet expose a clean `.is_()` for PostgREST `is`. Use `or_` with null check.
        response = (
            supabase
            .table('articles')
            .select('id, content')
            .or_('embedding.is.null')
            .limit(batch_size)
            .execute()
        )

        if not response.data:
            print("All articles already have embeddings. 🎉")
            break

        updates = []
        for row in response.data:
            content = row.get('content', '') or ''
            if not content or content.strip() in ("SCRAPE_FAILED",):
                continue  # skip problematic rows

            embedding = model.encode(content[:4000]).tolist()

            updates.append({
                'id': row['id'],
                'embedding': embedding
            })

        if updates:
            print(f"Updating {len(updates)} rows with new embeddings...")
            # Use returning='minimal' to reduce payload and avoid timeouts
            supabase.table('articles').upsert(updates, returning="minimal").execute()
            print("Batch upsert complete.")

# --- NEW ENRICHMENT FUNCTION ---

def enrich_and_embed_articles(batch_size: int = 20):
    """Scrape full content for Hacker-News articles (or any others) whose content is missing or obviously incomplete,
    then generate fresh embeddings.

    Criteria handled *client-side* (because PostgREST can't compare two columns):
      • content is None / NULL
      • content == title  (title-only placeholder)
      • len(content) < 300 characters  (very short — likely summary)
      • content == 'SCRAPE_FAILED' (previous failed attempt)
    """

    processed_any = False
    while True:
        print(f"\nQuerying potential rows to enrich (batch size={batch_size}) …")

        # First attempt – quickly grab rows with NULL or explicit failure markers (server-side filter)
        response = (
            supabase
            .table('articles')
            .select('id, url, title, content')
            .or_('content.is.null,content.eq.SCRAPE_FAILED')
            .limit(batch_size)
            .execute()
        )

        rows = response.data or []

        # If that returns fewer than we want, fall back to HN rows that look suspiciously short
        if len(rows) < batch_size:
            remaining = batch_size - len(rows)
            hn_resp = (
                supabase
                .table('articles')
                .select('id, url, title, content')
                .eq('company', 'Hacker News')
                .limit(remaining * 3)  # fetch a few extra and filter locally
                .execute()
            )
            for r in hn_resp.data or []:
                if r['content'] is None:
                    rows.append(r)
                    continue
                if r['content'].strip() == r['title'].strip():
                    rows.append(r)
                elif len(r['content']) < 300:
                    rows.append(r)
                if len(rows) >= batch_size:
                    break

        if not rows:
            if not processed_any:
                print("No articles matched the enrichment criteria. ✅")
            else:
                print("Enrichment complete. ✅")
            break

        print(f"Processing {len(rows)} articles …")

        updates = []
        for article in rows:
            print(f"  -> Scraping {article['url']}")

            try:
                downloaded = trafilatura.fetch_url(article['url'])
                full_content = trafilatura.extract(downloaded) or ""
            except Exception:
                full_content = ""

            if not full_content or len(full_content) < 200:
                # Still could not get good content
                print("     × Extraction failed or very short. Marking as SCRAPE_FAILED.")
                supabase.table('articles').update({'content': 'SCRAPE_FAILED'}).eq('id', article['id']).execute()
                continue

            embedding = model.encode(full_content[:4000]).tolist()

            updates.append({
                'id': article['id'],
                'content': full_content,
                'embedding': embedding
            })

        if updates:
            print(f"Upserting {len(updates)} enriched rows …")
            supabase.table('articles').upsert(updates, returning="minimal").execute()
            processed_any = True
            print("Batch saved.")

# To run enrichment, execute this file with ENRICH=1 env var.
if __name__ == "__main__":
    if os.getenv("ENRICH") == "1":
        enrich_and_embed_articles()
    else:
    generate_and_update_embeddings()

