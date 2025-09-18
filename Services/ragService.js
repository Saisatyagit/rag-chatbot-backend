// services/ragService.js
const { getLLMResponse } = require("./llmService");
const { searchVectorDB } = require("../utils/vectorDB"); // we'll build this later

async function ragPipeline(query) {
  try {
    // 1. Retrieve top documents from vector DB
    const retrievedDocs = await searchVectorDB(query);

    // 2. Build context
    const context = retrievedDocs.map(doc => doc.content).join("\n\n");

    // 3. Create final prompt
    const prompt = `
You are a helpful assistant for a news website. 
Answer the user's question based on the following news context.

Context:
${context}

User question:
${query}
    `;

    // 4. Call Gemini
    const response = await getLLMResponse(prompt);

    return response;
  } catch (err) {
    console.error("❌ RAG Pipeline Error:", err.message);
    return "Sorry, something went wrong in the RAG pipeline.";
  }
}

module.exports = { ragPipeline };

