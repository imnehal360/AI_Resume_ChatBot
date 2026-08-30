const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;
let embeddingModel = null;

function getEmbeddingModel() {
  if (!embeddingModel) {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY missing in environment variables");
    }
    genAI = new GoogleGenerativeAI(apiKey);
    embeddingModel = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });
  }
  return embeddingModel;
}

/**
 * Generate a dense vector embedding for a given text snippet.
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - 3072-dimensional vector array
 */
async function generateEmbedding(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return null;
  }

  try {
    const model = getEmbeddingModel();
    // Trim text to avoid exceeding token limit (embedding-001 supports up to 2048 tokens)
    const truncatedText = text.substring(0, 4000);
    const result = await model.embedContent(truncatedText);
    return result.embedding.values;
  } catch (err) {
    console.error("[EmbeddingService] Error generating embedding:", err.message);
    return null;
  }
}

/**
 * Compute Cosine Similarity between two numeric vectors.
 * Returns a value between -1.0 and 1.0 (typically 0.0 to 1.0 for positive semantic match).
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;

  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i];
    const b = vecB[i];
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
  generateEmbedding,
  cosineSimilarity
};
