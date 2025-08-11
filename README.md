# ErBlogX

AI-powered search for engineering blogs :- “The index for everything engineering.”

- Next.js 15 + React 18 + TypeScript
- FastAPI (Python 3.12)
- Supabase PostgreSQL (pgvector)
- Clerk authentication
- Sentence Transformers (`all-mpnet-base-v2`)
- GPT-4o-mini via ZnapAI
- Docker
- Deployed: Vercel (frontend) + Hugging Face Spaces (backend)

Live demo: https://erblogx.vercel.app  
Backend API: https://maskeen-erblogx.hf.space

## What it does
- Semantic search for 600+ engineering blog sources
- AI summaries: themes, patterns, and cross-article insights
- Personal library: bookmark and summarize saved articles
- Clean, responsive UI with dark/light mode
- Bi-weekly automated scraping and indexing

## Environment

Frontend (.env.local):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON=...
```

Backend (.env):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON=...
ZNAPAI_API_KEY=...
```

## Run
- Frontend:
  - `cd frontend`
  - `npm install`
  - `cp .env.example .env.local` (add Clerk + Supabase keys)
  - `npm run dev` → http://localhost:3000
- Backend:
  - `cd backend`
  - `pip install poetry` (if needed)
  - `poetry install`
  - `cp .env.example .env` (add Supabase + ZnapAI keys)
  - `poetry run uvicorn main:app --reload` → http://localhost:8000

## API
- GET `/ai-search?q=...`
- GET `/health`

## Architecture
- Frontend: Next.js app router, Tailwind CSS, Framer Motion, Clerk, Supabase client
- Backend: FastAPI, Sentence Transformers (`all-mpnet-base-v2`), ZnapAI (GPT-4o-mini), Supabase Postgres + pgvector
- Data pipeline: 600+ RSS feeds → Feedparser/Trafilatura/BeautifulSoup → embeddings → pgvector
- Deployment: Vercel (frontend), Hugging Face Spaces (Docker backend)
- Monitoring: Health checks + logging

## Project structure
```
erblogx/
├── frontend/          # Next.js app
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── services/
├── backend/           # FastAPI service
│   ├── main.py
│   ├── scraper.py
│   ├── vector.py
│   └── blogs.opml     # RSS feed sources
└── .github/           # CI/CD workflows
```

## Roadmap
- Coming soon:
  - Chat with articles
  - Discovery page
  - Enhanced search filters (company, date, topic, difficulty)
  - Content clusters
  - RSS subscriptions
- Future vision:
  - Podcast integration (transcripts)
  - Research papers with simplified explanations
  - Community features (share/discuss)
  - AI recommendations (personalized)
  - Multi-language support

## Key technologies
- Search: Sentence Transformers + PostgreSQL pgvector
- AI: GPT-4o-mini via ZnapAI
- Scraping: Feedparser + Trafilatura + BeautifulSoup
- Auth: Clerk
- Styling/UX: Tailwind CSS + Framer Motion
- Deployment: Docker + Vercel + Hugging Face Spaces

## Stats
- 16,000+ engineering articles indexed
- 600+ sources monitored
- Sub-second search response times
- 99.9% uptime
- Mobile-first design
- Open source (MIT)

## Contributing
- Fork → feature branch → changes → tests → PR
- Example:
  - `git checkout -b feature/amazing-feature`
  - `git commit -m "Add amazing feature"`
  - `git push origin feature/amazing-feature`
  - Open a Pull Request with details

## License
MIT

## Acknowledgments
Blog authors, the open source community, Hugging Face, Supabase, and Vercel.

## About
Built with ❤️ by [maskeen](https://github.com/mxskeen) :— “I built ErBlogX to make the best engineering insights easy to find and easier to learn.”
