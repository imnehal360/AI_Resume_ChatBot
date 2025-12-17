const axios = require("axios");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

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

  const response = await axios.post(
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
      }
    }
  );

  const content = response.data.choices[0].message.content;

  let jobs;
  try {
    jobs = safeJsonParse(content);
  } catch (err) {
    console.error("❌ Failed to parse AI JSON output");
    console.error(content);
    throw err;
  }

  // Post-process to guarantee applyUrl exists
  const normalizedJobs = jobs.map(job => ({
    ...job,
    applyUrl: job.applyUrl || fallbackApplyUrl
  }));

  return normalizedJobs;
};
