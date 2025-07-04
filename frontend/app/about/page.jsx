export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">About ErBlogX</h1>
      <section className="mb-8">
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-1">Current Features</h2>
        <ul className="list-disc ml-6 text-gray-700 space-y-1">
          <li>Semantic Search Over 16000+ engineering blogs/articles from 600+ sources</li>
          <li>AI-powered search and summary</li>
          <li>Save/bookmark articles </li>
          <li>Library for all saved articles</li>
          <li>Clean, responsive UI </li>
          <li>Backend enrichment and search over a constrained space (HN, minimal, batching, device-aware)</li>
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