export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">About ErBlogX</h1>
      <section className="mb-8">
        <p className="text-gray-600 mb-4">
          ErBlogX is an AI-powered search engine for engineering content. Search through 16,000+ articles from 600+ sources instantly - no sign-up required. Sign in to save articles and get AI-powered summaries.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-1">Current Features</h2>
        <ul className="list-disc ml-6 text-gray-700 space-y-1">
          <li><strong>Open Search:</strong> Semantic search over 16,000+ engineering blogs/articles from 600+ sources - no authentication required</li>
          <li><strong>AI-Powered Summaries:</strong> Get intelligent summaries of search results (requires sign-in)</li>
          <li><strong>Personal Library:</strong> Save/bookmark articles for later reading (requires sign-in)</li>
          <li><strong>Library Management:</strong> Organize and summarize your saved articles collection</li>
          <li><strong>Responsive Design:</strong> Clean, mobile-first UI with dark/light mode support</li>
          <li><strong>Always Fresh:</strong> Automated bi-weekly content updates via GitHub Actions</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-1">Future Vision</h2>
        <ul className="list-disc ml-6 text-gray-700 space-y-1">
          <li>Chat with individual blogs/articles</li>
          <li>More discovery tools and content sources inc. podcast transcripts, research stuff</li>
          <li>User profiles and customization</li>
          <li>AI recommendations</li>
          <li>Community features and sharing</li>
          <li>Blogs and articles clusters</li>
        </ul>
      </section>
    </div>
  );
} 