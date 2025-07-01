from fastapi import FastAPI, HTTPException
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer 
import numpy as np
from pydantic import BaseModel
from typing import List, Union
import openai

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON = os.getenv("SUPABASE_ANON")
ZNAPAI_API_KEY = os.getenv("ZNAPAI_API_KEY")

if not ZNAPAI_API_KEY:
    print("Warning: ZNAPAI_API_KEY not found in environment variables")

supabase:Client=create_client(SUPABASE_URL,SUPABASE_ANON)

print("Loading sentence-transformer model...")
# Use a model that produces 768-dimensional vectors
model = SentenceTransformer('all-mpnet-base-v2', device="cpu")
print("Model loaded.")

# Initialize OpenAI client for ZnapAI
openai_client = openai.OpenAI(
    api_key=ZNAPAI_API_KEY,
    base_url="https://api.znapai.com/"
)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

# Pydantic models for request/response
class SummarizeRequest(BaseModel):
    query: str
    article_ids: List[Union[str, int]]

class SummarizeResponse(BaseModel):
    summary: str
    query: str
    article_count: int
    themes: List[str]

@app.get("/")
def read_root():
    return "erblogx api :)"

@app.get("/test")
def test_function():
    return "this is test function"

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
            'match_threshold': 0.2,  # Lower threshold to catch more relevant results
            'match_count': 10       # Get more matches
        }).execute()

        return {"results": data[1]}
    except Exception as e:
        print(f"Semantic search error: {str(e)}")
        return {"error": str(e), "results": []}

@app.post("/summarize-results")
def summarize_search_results(request: SummarizeRequest):
    """Summarizes all articles from search results using GPT-4o-mini via ZnapAI"""
    
    print(f"Received summarization request: query='{request.query}', article_ids={len(request.article_ids)} articles")
    
    if not ZNAPAI_API_KEY:
        raise HTTPException(status_code=500, detail="ZnapAI API key not configured")
    
    if not request.article_ids:
        raise HTTPException(status_code=400, detail="No articles provided for summarization")
    
    try:

        try:
            integer_article_ids = [int(id_val) for id_val in request.article_ids]
        except (ValueError, TypeError) as e:
            raise HTTPException(status_code=400, detail=f"Invalid article ID format. All IDs must be convertible to integers. Error: {str(e)}")
           
        
        # Fetch article contents from Supabase
        print(f"Fetching {len(integer_article_ids)} articles for summarization...")
        
        response = supabase.table('articles').select('id, title, content, company, url').in_('id', integer_article_ids).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="No articles found")
        
        articles = response.data
        print(f"Found {len(articles)} articles")
        
        # Prepare content for AI summarization
        article_texts = []
        for article in articles:
            article_summary = f"Title: {article['title']}\nCompany: {article['company']}\nContent: {article['content'][:1000]}..."  # Limit content to avoid token limits
            article_texts.append(article_summary)
        
        # Create prompt for GPT-4o-mini
        combined_content = "\n\n---\n\n".join(article_texts)
        
        system_prompt = """You are an expert technical analyst who specializes in summarizing engineering and technology articles. 
        Your task is to analyze multiple articles and provide a comprehensive, insightful summary that identifies:
        1. Key themes and trends
        2. Common technical approaches or solutions
        3. Emerging patterns in the engineering space
        4. Important insights that would be valuable to software engineers

        Keep your summary concise but informative, focusing on actionable insights and technical trends."""

        user_prompt = f"""Based on the user's search query: "{request.query}"

        Please analyze and summarize the following {len(articles)} engineering articles. Identify the main themes, technical approaches, and key insights that would be most valuable to software engineers:

        {combined_content}

        Provide a comprehensive summary that covers:
        1. The main themes and topics discussed across these articles
        2. Key technical insights and approaches mentioned
        3. Common patterns or trends you notice
        4. Practical takeaways for engineers

        Keep the summary engaging and informative, around 200-300 words."""

        print(f"Prepared prompts. System prompt length: {len(system_prompt)}, User prompt length: {len(user_prompt)}")
        print(f"API Key configured: {bool(ZNAPAI_API_KEY)}, API Key length: {len(ZNAPAI_API_KEY) if ZNAPAI_API_KEY else 0}")

        # Call ZnapAI API
        print("Calling ZnapAI API for summarization...")
        try:
            completion = openai_client.chat.completions.create(
                model="gpt-4o-mini",  # Changed from gpt-4.1-mini to gpt-4o-mini based on ZnapAI docs
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            ai_summary = completion.choices[0].message.content
            print(f"AI Summary generated successfully: {ai_summary[:100]}...")
            
        except Exception as api_error:
            print(f"ZnapAI API Error: {str(api_error)}")
            print(f"Error type: {type(api_error)}")
            # Provide a more detailed error message
            raise HTTPException(
                status_code=500, 
                detail=f"ZnapAI API Error: {str(api_error)}. Please check your API key and model availability."
            )
        
        # Extract themes (simple keyword extraction from titles)
        themes = []
        all_titles = " ".join([article['title'].lower() for article in articles])
        common_tech_terms = ['api', 'database', 'cloud', 'microservices', 'kubernetes', 'docker', 'ai', 'machine learning', 'performance', 'scalability', 'security', 'testing', 'devops', 'frontend', 'backend', 'infrastructure']
        
        for term in common_tech_terms:
            if term in all_titles:
                themes.append(term.title())
        
        # Limit to top 5 themes
        themes = themes[:5] if themes else ["Engineering", "Technology"]
        
        print(f"Generated summary successfully. Themes: {themes}")
        
        return SummarizeResponse(
            summary=ai_summary,
            query=request.query,
            article_count=len(articles),
            themes=themes
        )
        
    except Exception as e:
        print(f"Summarization error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

@app.get("/test-znapai")
def test_znapai_connection():
    """Test ZnapAI API connection with a simple request"""
    if not ZNAPAI_API_KEY:
        return {"error": "ZnapAI API key not configured"}
    
    try:
        print("Testing ZnapAI API connection...")
        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": "Hello! Please respond with 'API connection successful'"}
            ],
            max_tokens=50
        )
        
        response_text = completion.choices[0].message.content
        print(f"ZnapAI API test successful: {response_text}")
        
        return {
            "status": "success",
            "response": response_text,
            "model_used": "gpt-4o-mini"
        }
        
    except Exception as e:
        print(f"ZnapAI API test failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "error_type": str(type(e))
        }
