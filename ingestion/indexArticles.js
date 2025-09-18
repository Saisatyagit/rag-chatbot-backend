const vectorDB = require("../utils/vectorClient");

async function indexArticles(articles) {
  const points = articles.map(article => ({
    id: article.id,
    vector: article.embedding,
    payload: {
      title: article.title,
      url: article.url,
      publishedAt: article.publishedAt,
    },
  }));

  await vectorDB.upsert({
    collection_name: "news",
    points,
  });

  console.log(`✅ Indexed ${articles.length} articles in vector DB`);
}

module.exports = { indexArticles };
