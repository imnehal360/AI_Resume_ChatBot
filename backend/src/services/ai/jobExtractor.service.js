const axios = require("axios");
const https = require("https");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Force IPv4 to avoid ENOTFOUND on some networks
const agent = new https.Agent({ family: 4 });

/**
 * Extract Perplexity search URL as fallback apply link
 */
function extractPerplexityLink(text) {
  const match = text.match(/https:\/\/www\.perplexity\.ai\/search\/[^\s]+/);
  return match ? match[0] : null;
}

/**
 * Safely parse JSON returned by LLMs
 */
function safeJsonParse(text) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

exports.extractJobsFromText = async (emailText) => {
  const fallbackApplyUrl = extractPerplexityLink(emailText);

  const prompt = `
You are a backend JSON extraction service.

CRITICAL RULES:
- Output MUST be valid JSON
- Output ONLY raw JSON (no markdown, no backticks)
- Do NOT add explanations
- Do NOT add comments

Extract ALL job opportunities from the text below.

If a direct apply link is not present, use this fallback apply URL:
"${fallbackApplyUrl}"

If any field is missing, use null.

Output schema:
[
  {
    "title": string,
    "company": string,
    "location": string,
    "experienceLevel": "intern" | "fresher" | "professional" | null,
    "skillsRequired": string[],
    "applyUrl": string | null
  }
]

TEXT:
"""${emailText}"""
`;

  // Retry logic for 429 Rate Limits
  const maxRetries = 5;
  let attempt = 0;
  let response;

  while (attempt < maxRetries) {
    try {
      response = await axios.post(
        GROQ_URL,
        {
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          httpsAgent: agent
        }
      );
      break; // Success
    } catch (err) {
      if (err.response && err.response.status === 429) {
        attempt++;
        const delay = 2000 * Math.pow(2, attempt); // Exponential backoff: 2s, 4s, 8s...
        console.warn(`[AI] Rate limited. Retrying in ${delay / 1000}s... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw err; // Other errors (500, 401, etc.)
      }
    }
  }

  if (!response) {
    throw new Error("AI Request failed after multiple retries due to rate limiting.");
  }

  const content = response.data.choices[0].message.content;

  let jobs;
  try {
    jobs = safeJsonParse(content);
  } catch (err) {
    console.error("❌ Failed to parse AI JSON output");
    console.error(content);
    throw err;
  }

  if (!Array.isArray(jobs)) {
    console.warn("AI returned non-array structure:", jobs);
    return [];
  }

  // Post-process:
  // 1. Guarantee applyUrl exists
  // 2. Filter out invalid jobs (missing title or company)
  const validJobs = jobs
    .filter(job => job.title && job.company) // Filter out null/empty title/company
    .map(job => ({
      ...job,
      applyUrl: job.applyUrl || fallbackApplyUrl
    }));

  return validJobs;
};
