// routes/newsRoute.js
const express = require("express");
const router = express.Router();
const {
  ingestNews,
  getLatestNews,
  clearNews,
  searchNews,
} = require("../controller/newsController");

// Ingest news articles (POST /api/news/ingest)
// Expects body: { articles: [{ title, description, url, date }, ...] }
router.post("/ingest", ingestNews);

// Get latest news (GET /api/news/latest)
// Optional query: ?limit=10
router.get("/latest", getLatestNews);

// Clear all news (DELETE /api/news/clear)
router.delete("/clear", clearNews);

// Search news (POST /api/news/search)
// Expects body: { query: "keyword", limit: 10 }
router.post("/search", searchNews);

module.exports = router;

