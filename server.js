// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// Redis setup
const redis = require("redis");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

// Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});
redisClient.connect()
  .then(() => console.log("✅ Redis connected"))
  .catch(err => console.error("Redis connection error:", err));

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "RAG Chatbot Backend is running 🚀" });
});

// Routes
const chatRoutes = require("./routes/chatRoutes");
const newsRoute = require("./routes/newsRoute");

app.use("/api/chat", chatRoutes);
app.use("/api/news", newsRoute);

// Serve frontend (if deploying single repo)
app.use(express.static(path.join(__dirname, "../frontend/build")));
// Serve frontend for any unmatched route (after API routes)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});


// Socket.IO events
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // Send chat history
  socket.on("get_history", async ({ sessionId }) => {
    try {
      const messages = await redisClient.lRange(sessionId, 0, -1);
      const parsed = messages.map(m => JSON.parse(m));
      socket.emit("chat_history", parsed);
    } catch (err) {
      console.error("Error fetching history:", err);
      socket.emit("chat_history", []);
    }
  });

  // Receive user message
  socket.on("send_message", async ({ sessionId, message }) => {
    try {
      const userMsg = { role: "user", content: message };
      await redisClient.rPush(sessionId, JSON.stringify(userMsg));

      // Typing indicator
      socket.emit("bot_typing", true);

      // === PLACEHOLDER: Call your RAG/Gemini pipeline here ===
      const botResponse = `You said: ${message}`; // replace with actual AI response

      const botMsg = { role: "assistant", content: botResponse };
      await redisClient.rPush(sessionId, JSON.stringify(botMsg));

      socket.emit("receive_message", botMsg);
      socket.emit("bot_typing", false);

    } catch (err) {
      console.error("Error sending message:", err);
      socket.emit("receive_message", {
        role: "assistant",
        content: "⚠️ Error fetching response."
      });
      socket.emit("bot_typing", false);
    }
  });

  // Clear session
  socket.on("clear_session", async ({ sessionId }) => {
    try {
      await redisClient.del(sessionId);
      socket.emit("session_cleared");
    } catch (err) {
      console.error("Error clearing session:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// 404 route
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
