const { QdrantClient } = require("@qdrant/js-client-rest");
const axios = require("axios");

// Jina Embeddings API
async function getEmbedding(text) {
  const res = await axios.post("https://api.jina.ai/v1/embeddings", {
    model: "jina-embeddings-v2-base-en",
    input: text,
  }, {
    headers: { Authorization: `Bearer ${process.env.JINA_API_KEY}` }
  });

  return res.data.data[0].embedding;
}

const client = new QdrantClient({ url: process.env.QDRANT_URL || "http://localhost:6333" });

async function searchVectorDB(query) {
  const embedding = await getEmbedding(query);

  const result = await client.search("news_articles", {
    vector: embedding,
    limit: 3,
  });

  return result.map(r => ({
    content: r.payload.content,
    score: r.score,
  }));
}

module.exports = { searchVectorDB };
