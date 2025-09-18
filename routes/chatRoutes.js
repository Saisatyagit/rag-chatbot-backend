const express = require("express");
const router = express.Router();
const {
  startSession,
  getHistory,
  clearSession,
  sendMessage
} = require("../controller/chatController");

router.post("/start", startSession);            // Create session
router.post("/send/:sessionId", sendMessage);   // Send message
router.get("/history/:sessionId", getHistory);  // Get session history
router.delete("/clear/:sessionId", clearSession); // Clear session

module.exports = router;


