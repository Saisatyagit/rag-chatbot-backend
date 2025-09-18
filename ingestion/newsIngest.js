require("dotenv").config();
const { fetchRSS } = require("./fetchrss");
const { embedArticles } = require("./embedArticles");
const { indexArticles } = require("./indexArticles");

async function ingestNews() {
  const rssFeed = "https://www.reuters.com/arc/outboundfeeds/sitemap-index/?outputType=xml";

  // Step 1: Fetch articles
  const articles = await fetchRSS(rssFeed);
  if (articles.length === 0) return;

  // Step 2: Generate embeddings
  const embeddedArticles = await embedArticles(articles);

  // Step 3: Store embeddings in vector DB
  await indexArticles(embeddedArticles);

  console.log("🎉 News ingestion completed!");
}

ingestNews();
