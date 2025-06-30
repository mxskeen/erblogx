from fastapi import FastAPI
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON = os.getenv("SUPABASE_ANON")

supabase:Client=create_client(SUPABASE_URL,SUPABASE_ANON)
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
