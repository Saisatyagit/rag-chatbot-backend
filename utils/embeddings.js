const { OpenAIEmbeddings } = require("openai"); // Or Jina embeddings
const client = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });

async function getEmbedding(text) {
  try {
    const embedding = await client.embed({ input: text });
    return embedding.data[0].embedding;
  } catch (err) {
    console.error("❌ Embedding error:", err.message);
    return [];
  }
}

module.exports = { getEmbedding };
