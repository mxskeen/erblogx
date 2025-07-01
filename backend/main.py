from fastapi import FastAPI
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer 
import numpy as np

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON = os.getenv("SUPABASE_ANON")

supabase:Client=create_client(SUPABASE_URL,SUPABASE_ANON)

print("Loading sentence-transformer model...")
# Use a model that produces 768-dimensional vectors
model = SentenceTransformer('all-mpnet-base-v2', device="cpu")
print("Model loaded.")

app = FastAPI()

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

@app.get("/")
def read_root():
    return "erblogx api :)"

@app.get("/search")
def search_query(q: str):
    data,count = supabase.table('articles').select('*').ilike('title',f'%{q}%').execute()
    search_query = data[1]

    return {"results":search_query}


@app.get("/ai-search")
def semantic_search_articles(q: str):
    """Performs AI-powered semantic search."""
    # 1. Create an embedding for the user's search query
    query_embedding = model.encode(q).tolist()

    # 2. Call the database function to find matches
    try:
        data, count = supabase.rpc('match_articles', {
            'query_embedding': query_embedding,
            'match_threshold': 0.2,  # Lower threshold from 0.5 to 0.3 to catch more relevant results
            'match_count': 10       # Get more matches
        }).execute()

        return {"results": data[1]}
    except Exception as e:
        print(f"Semantic search error: {str(e)}")
        return {"error": str(e), "results": []}
