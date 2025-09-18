const { getEmbedding } = require("../utils/embeddings");

async function embedArticles(articles) {
  for (let article of articles) {
    article.embedding = await getEmbedding(article.content);
    console.log(`📝 Embedded article: ${article.title}`);
  }
  return articles;
}

module.exports = { embedArticles };
