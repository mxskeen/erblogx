import os
from supabase import create_client, Client
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import torch

# --- SETUP ---
load_dotenv()

# Initialize Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON = os.getenv("SUPABASE_ANON")
if not SUPABASE_URL or not SUPABASE_ANON:
    raise Exception("Supabase credentials not found.")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON)

# Set device for PyTorch
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

# Load the Sentence Transformer model
print("Loading sentence-transformer model...")
model = SentenceTransformer('all-mpnet-base-v2', device=device)
print("Model loaded.")

# --- MAIN LOGIC ---
def generate_and_update_embeddings():
    batch_size = 500
    while True:
        print(f"\nFetching a batch of {batch_size} articles without embeddings...")
        response = supabase.table('articles').select('id, content').is_('embedding', None).limit(batch_size).execute()

        if not response.data:
            print("No more articles to process. All done!")
            break

        articles = response.data
        print(f"Found {len(articles)} articles to process.")

        # Prepare content for embedding
        contents_to_embed = []
        for article in articles:
            content = article.get('content', '').strip()
            # Use a placeholder for empty content, otherwise truncate.
            contents_to_embed.append(content[:4000] if content else "no content")

        print(f"Generating embeddings for {len(contents_to_embed)} articles...")
        embeddings = model.encode(contents_to_embed).tolist()

        updates = [
            {'id': article['id'], 'embedding': embedding}
            for article, embedding in zip(articles, embeddings)
        ]

        print(f"Saving {len(updates)} embeddings to the database...")
        supabase.table('articles').upsert(updates).execute()
        print("Batch saved successfully.")

if __name__ == "__main__":
    generate_and_update_embeddings()