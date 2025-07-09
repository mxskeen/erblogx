# 🚀 ErBlogX - The AI-Powered Engineering Blog Search Engine

> *"The index for everything engineering"* - Your gateway to 16,000+ engineering articles from 600+ top-tier tech companies and thought leaders.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-blue)](https://erblogx.vercel.app) [![Backend API](https://img.shields.io/badge/Backend-Hugging%20Face%20Spaces-orange)](https://maskeen-erblogx.hf.space) [![License](https://img.shields.io/badge/License-MIT-green)](#) [![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org)

---

## 🎯 What is ErBlogX?

Ever felt overwhelmed trying to find that perfect engineering article buried somewhere in the vast ocean of tech blogs? **ErBlogX** is here to change that. 

It's an AI-powered search engine that cuts through the noise and delivers exactly what you're looking for from the world's best engineering content. Think of it as your personal engineering librarian who never sleeps and has read every blog post from Google, Netflix, Airbnb, and hundreds of other tech companies.

### 🌟 The Problem We're Solving

- **Information Overload**: 600+ engineering blogs, thousands of new articles weekly
- **Poor Discoverability**: Great content buried in company blogs
- **Context Loss**: Finding related articles across different sources
- **Time Waste**: Hours spent searching instead of learning

### ✨ The ErBlogX Solution

**Semantic AI Search** → **Instant Summaries** → **Personal Library** → **Never Miss Great Content Again**

---

## 🔥 Features That Make ErBlogX Special

### 🧠 **AI-Powered Semantic Search**
No more keyword hunting! Ask natural questions like:
- *"How do large companies handle microservices deployment?"*
- *"What are the latest trends in ML infrastructure?"*
- *"How does Netflix handle video streaming at scale?"*

### 🤖 **Intelligent Summarization**
Get AI-generated summaries that identify:
- Key technical themes and patterns
- Common approaches across companies
- Actionable insights for engineers
- Emerging trends in the industry

### 📚 **Personal Engineering Library**
- Bookmark articles with one click
- Summarize your entire saved collection
- Organize your engineering knowledge
- Never lose track of valuable content

### 🎨 **Beautiful, Modern Interface**
- Clean, responsive design
- Dark/light mode support
- Mobile-first approach
- Intuitive search experience

### 🔄 **Always Fresh Content**
- Automated bi-weekly scraping via GitHub Actions
- 600+ curated engineering blog sources
- From startups to FAANG companies
- Academic conferences and research labs

---

## 🏗️ Technical Architecture

### Frontend Stack
```
Next.js 15 + React 18 + TypeScript
├── 🎨 Tailwind CSS + Framer Motion
├── 🔐 Clerk Authentication
├── 🗃️ Supabase Client
├── 📱 Responsive Design
└── 🚀 Deployed on Vercel
```

### Backend Stack
```
FastAPI + Python 3.12
├── 🤖 Sentence Transformers (all-mpnet-base-v2)
├── 🧠 OpenAI GPT-4o-mini via ZnapAI
├── 🗄️ Supabase PostgreSQL
├── 🔍 Vector Similarity Search
├── 🐳 Docker Containerized
└── ☁️ Deployed on Hugging Face Spaces
```

### Data Pipeline
```
RSS Feeds → Trafilatura → Content Extraction → Embeddings → Vector DB
├── 📡 600+ RSS feeds monitored
├── 🔄 Automated scraping every 2 weeks
├── 🧮 Vector embeddings for semantic search
└── 📊 PostgreSQL with pgvector
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- Supabase account
- Clerk account (for auth)
- ZnapAI API key (for AI summaries)

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/mxskeen/erblogx.git
cd erblogx/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Clerk and Supabase keys

# Run development server
npm run dev
```

### Backend Setup
```bash
cd erblogx/backend

# Install Poetry (dependency manager)
pip install poetry

# Install dependencies
poetry install

# Set up environment variables
cp .env.example .env
# Add your Supabase and ZnapAI keys

# Run the API server
poetry run uvicorn main:app --reload
```

### Environment Variables

**Frontend (.env.local)**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON=eyJ...
```

**Backend (.env)**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON=eyJ...
ZNAPAI_API_KEY=your_znapai_key_here
```

---

## 🎯 Core Features in Detail

### 🔍 **Semantic Search Engine**
- **Vector Embeddings**: Uses `all-mpnet-base-v2` for high-quality semantic understanding
- **Similarity Matching**: PostgreSQL with pgvector for lightning-fast searches
- **Smart Ranking**: Combines semantic similarity with relevance scoring

### 🤖 **AI Summarization**
- **GPT-4o-mini Integration**: Cost-effective, high-quality summaries
- **Theme Extraction**: Automatically identifies key technical themes
- **Cross-Article Analysis**: Finds patterns across multiple sources
- **Engineer-Focused**: Summaries tailored for technical professionals

### 📊 **Content Sources**
Our carefully curated collection includes:

**FAANG & Big Tech**
- Google, Meta, Netflix, Amazon, Microsoft, Apple
- Uber, Airbnb, Spotify, Stripe, Shopify
- Tesla, SpaceX, Twitter, LinkedIn

**Innovative Startups**
- OpenAI, Anthropic, Scale AI, Hugging Face
- Vercel, Supabase, PlanetScale, Railway
- Linear, Notion, Figma, Canva

**Academic & Research**
- Stanford AI Lab, MIT CSAIL, DeepMind
- NeurIPS, ICML, ICLR conference blogs
- Top university computer science departments

---


### Final Architecture
- **Frontend**: Vercel (seamless Next.js deployment)
- **Backend**: Hugging Face Spaces (Docker with ML support)
- **Database**: Supabase (PostgreSQL with pgvector)
- **Auth**: Clerk (secure, scalable authentication)
- **Monitoring**: Built-in health checks and logging

---

## 📈 What's Next?

### 🚧 **Coming Soon**
- [ ] **Chat with Articles**: Have conversations with individual blog posts
- [ ] **Discovery Page**: Trending topics and recommended reads
- [ ] **Enhanced Search**: Filters by company, date, topic, difficulty
- [ ] **Content Clusters**: Group related articles by themes
- [ ] **RSS Subscriptions**: Follow your favorite engineering blogs

### 🎯 **Future Vision**
- **Podcast Integration**: Transcripts from engineering podcasts
- **Research Papers**: Academic CS papers with simplified explanations
- **Community Features**: Share and discuss articles with other engineers
- **AI Recommendations**: Personalized content suggestions
- **Multi-language Support**: Content in different programming languages

---

## 🛠️ Development

### Project Structure
```
erblogx/
├── frontend/          # Next.js frontend application
│   ├── app/          # App router pages
│   ├── components/   # Reusable UI components
│   ├── lib/          # Utilities and configuration
│   └── services/     # API integrations
├── backend/          # FastAPI backend
│   ├── main.py      # Main application entry
│   ├── scraper.py   # Blog scraping system
│   ├── vector.py    # Embedding generation
│   └── blogs.opml   # RSS feed sources
└── .github/         # CI/CD workflows
```

### Key Technologies
- **Search**: Sentence Transformers + PostgreSQL pgvector
- **AI**: OpenAI GPT-4o-mini via ZnapAI
- **Scraping**: Feedparser + Trafilatura + BeautifulSoup
- **Auth**: Clerk with React integration
- **Styling**: Tailwind CSS + Framer Motion
- **Deployment**: Docker + Vercel + Hugging Face Spaces

---

## 🤝 Contributing

We'd love your help making ErBlogX even better! Here's how:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit with clear messages**: `git commit -m 'Add amazing feature'`
5. **Push to your branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request** with a detailed description

### Areas We Need Help With
- **Blog Sources**: Know great engineering blogs we're missing?
- **UI/UX**: Designers welcome for interface improvements
- **Performance**: Help optimize search and loading times
- **Features**: Discovery page, advanced filters, mobile app
- **Content**: Better categorization and tagging

---

## 📊 Stats & Impact

- **16,000+** Engineering articles indexed
- **600+** Blog sources monitored
- **Sub-second** search response times
- **99.9%** Uptime across both services
- **Mobile-first** responsive design
- **Open Source** and community-driven

---

## 👨‍💻 About the Creator

Built with ❤️ by **[maskeen](https://github.com/mxskeen)**

*"I built ErBlogX because I was tired of spending more time searching for good engineering content than actually reading it. The best insights are scattered across hundreds of company blogs, and I wanted to make them accessible to every engineer."*

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Blog Authors**: The amazing engineers who share their knowledge
- **Open Source Community**: For the incredible tools that make this possible
- **Hugging Face**: For providing free ML-friendly hosting
- **Supabase**: For the fantastic developer experience
- **Vercel**: For seamless frontend deployment

---

<div align="center">

### 🚀 Ready to discover amazing engineering content?

**[Try ErBlogX Now →](https://erblogx.vercel.app)**

*Search smarter, learn faster, engineer better.*

---

</div> 
