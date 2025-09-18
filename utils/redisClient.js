// utils/redisClient.js
const { createClient } = require("redis");

const redis = createClient({
  url: "redis://127.0.0.1:6379" // update if using cloud
});

redis.on("error", (err) => console.error("❌ Redis Client Error", err));

// Connect once when app starts
(async () => {
  try {
    await redis.connect();
    console.log("✅ Redis connected");
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
  }
})();

module.exports = redis;
