# Backend Setup for AI Summarization

## Environment Variables Required

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON=your_supabase_anon_key

# ZnapAI Configuration for GPT-4o-mini
ZNAPAI_API_KEY=your_znapai_api_key_here
```

## Getting Your ZnapAI API Key

1. Sign up at ZnapAI (the service you provided)
2. Get your API key from your dashboard
3. Add it to your `.env` file as `ZNAPAI_API_KEY=your_key_here`

## Testing the API Connection

Before using the summarization feature, test your API connection:

```bash
# Start the backend server
cd backend
poetry run uvicorn main:app --reload --port 8000

# Test the API connection
curl http://localhost:8000/test-znapai
```

This should return a success response if your API key is working correctly.

## Testing the Summarization Endpoint

Once your environment is set up, you can test the summarization endpoint:

```bash
# The summarization endpoint will be available at:
# POST http://localhost:8000/summarize-results
```

## Features

- Uses GPT-4o-mini via ZnapAI API (corrected from gpt-4.1-mini)
- Analyzes multiple articles at once
- Extracts key themes and technical insights
- Provides comprehensive summaries for engineers
- Fallback error handling if API is unavailable

## Troubleshooting

### 422 Unprocessable Entity Error
This usually means:
1. **Wrong model name**: Make sure you're using `gpt-4o-mini` (not `gpt-4.1-mini`)
2. **Invalid API key**: Check your ZNAPAI_API_KEY in the .env file
3. **Prompt too long**: The system automatically limits content to avoid token limits

### Testing Steps
1. First test the basic API connection with `/test-znapai`
2. Check the backend logs for detailed error messages
3. Verify your .env file has the correct ZNAPAI_API_KEY

### Available Models
Based on ZnapAI documentation:
- `gpt-4o-mini` (recommended for cost-effectiveness)
- `gpt-4o` (flagship model)
- `o1-mini` (reasoning model)

## Usage Flow

1. User searches for articles
2. Results are displayed
3. User clicks brain icon
4. Backend fetches article contents
5. GPT-4o-mini generates comprehensive summary
6. Frontend displays summary with themes and insights 