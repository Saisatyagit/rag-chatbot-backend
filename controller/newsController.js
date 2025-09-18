// controllers/newsController.js
const redis = require("../utils/redisClient");

// Ingest news articles
const ingestNews = async (req, res) => {
  const { articles } = req.body;
  if (!articles || !Array.isArray(articles))
    return res.status(400).json({ error: "Articles array required" });

  try {
    for (const article of articles) {
      // Add a timestamp if not present
      if (!article.date) article.date = new Date().toISOString();
      await redis.lPush("news:articles", JSON.stringify(article));
    }
    res.json({ message: `${articles.length} articles ingested` });
  } catch (err) {
    console.error("❌ Failed to ingest news:", err.message);
    res.status(500).json({ error: "Failed to ingest news" });
  }
};

// Get latest articles
// Optional query param: ?limit=10
const getLatestNews = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  try {
    const data = await redis.lRange("news:articles", 0, -1);
    const articles = data.map((a) => JSON.parse(a));

    // Sort by date descending
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ count: articles.length, articles: articles.slice(0, limit) });
  } catch (err) {
    console.error("❌ Failed to fetch news:", err.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
};

// Clear all news
const clearNews = async (req, res) => {
  try {
    await redis.del("news:articles");
    res.json({ message: "🗑️ All news cleared" });
  } catch (err) {
    console.error("❌ Failed to clear news:", err.message);
    res.status(500).json({ error: "Failed to clear news" });
  }
};

// Search news
// Optional query param in body: { query: "keyword", limit: 10 }
const searchNews = async (req, res) => {
  const { query, limit } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  const l = parseInt(limit) || 10;

  try {
    const data = await redis.lRange("news:articles", 0, -1);
    const articles = data.map((a) => JSON.parse(a));

    const results = articles.filter(
      (article) =>
        (article.title && article.title.toLowerCase().includes(query.toLowerCase())) ||
        (article.description &&
          article.description.toLowerCase().includes(query.toLowerCase()))
    );

    // Sort by date descending
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ count: results.length, articles: results.slice(0, l) });
  } catch (err) {
    console.error("❌ Failed to search news:", err.message);
    res.status(500).json({ error: "Failed to search news" });
  }
};

module.exports = { ingestNews, getLatestNews, clearNews, searchNews };
