const redisClient = require("../utils/redisClient");
const { getLLMResponse } = require("../Services/llmService");

const SESSION_TTL = parseInt(process.env.SESSION_TTL || "3600");

// Save message to Redis
async function saveMessage(sessionId, message) {
  await redisClient.rPush(`session:${sessionId}`, JSON.stringify(message));
  await redisClient.expire(`session:${sessionId}`, SESSION_TTL);
}

// Start a new session
async function startSession(req, res) {
  const sessionId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  res.json({ sessionId });
}

// Get session history
async function getHistory(req, res) {
  try {
    const { sessionId } = req.params;
    const data = await redisClient.lRange(`session:${sessionId}`, 0, -1); // ✅ updated
    const messages = data.map((d) => JSON.parse(d));
    res.json({ messages });
  } catch (err) {
    console.error("Redis getHistory error:", err);
    res.status(500).json({ error: "Failed to get session history" });
  }
}

// Clear session
async function clearSession(req, res) {
  try {
    const { sessionId } = req.params;
    await redisClient.del(`session:${sessionId}`);
    res.json({ message: "Session cleared" });
  } catch (err) {
    console.error("Redis clearSession error:", err);
    res.status(500).json({ error: "Failed to clear session" });
  }
}

// Send message
async function sendMessage(req, res) {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required" });

    // Save user message
    await saveMessage(sessionId, { role: "user", content: message });

    // Get LLM response
    const responseText = await getLLMResponse(message);

    // Save assistant response
    await saveMessage(sessionId, { role: "assistant", content: responseText });

    res.json({ response: responseText });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ response: "Something went wrong" });
  }
}

module.exports = {
  startSession,
  getHistory,
  clearSession,
  sendMessage
};
