const axios = require("axios");
const xml2js = require("xml2js");

async function fetchRSS(url) {
  try {
    const res = await axios.get(url);
    const parser = new xml2js.Parser();
    const data = await parser.parseStringPromise(res.data);

    const articles = data.rss.channel[0].item.map(item => ({
      id: item.guid[0]._ || item.link[0],
      title: item.title[0],
      content: item.description[0],
      url: item.link[0],
      publishedAt: item.pubDate[0],
    }));

    console.log(`✅ Fetched ${articles.length} articles`);
    return articles;
  } catch (err) {
    console.error("❌ Failed to fetch RSS:", err.message);
    return [];
  }
}

module.exports = { fetchRSS };
