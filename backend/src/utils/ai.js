const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelFlash = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});

const modelPro = genAI.getGenerativeModel({
  model: "gemini-2.5-pro",
  generationConfig: { responseMimeType: "application/json" }
});

// Helper for exponential backoff retry
async function retryGeminiCall(operation, maxRetries = 3, initialDelay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (err) {
      const isRateLimit = err.message.includes("429") || err.status === 429;
      if (isRateLimit && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`Gemini 429 Rate Limit. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}
// Strip markdown code fences Gemini sometimes adds before JSON.parse
function safeParseJSON(text) {
  const cleaned = text
    .replace(/^```[\w]*\n?/m, '')  // strip opening ```json or ```
    .replace(/```\s*$/m, '')        // strip closing ```
    .trim();
  return JSON.parse(cleaned);
}



exports.extractResumeFromChat = async (chatMessage, existingResume = {}, chatHistory = []) => {
  // Convert chat history to Gemini format
  const history = chatHistory.map(msg => ({
    role: msg.role === "ai" ? "model" : "user",
    parts: [{ text: msg.text }]
  }));

  const systemInstruction = `You are an expert Resume Assistant AI.
Role: Hybrid executioner and advisor.
Goal: Update the user's resume data JSON based on their input, while ACTIVELY ENGAGING with them.

CORE RESPONSIBILITIES:
1. EXECUTE: Do exactly what the user asks.
2. ANALYZE: Identify missing sections.
3. ENGAGE: Ask follow-up questions.
4. ENFORCE SEQUENTIALITY: Don't let user skip pending questions without acknowledgment.

OUTPUT RULES:
- Return ONLY a strictly valid JSON object.
- Schema must include all resume fields plus "chat_response".
- "chat_response" MUST end with a question to keep the conversation going.`;

  const userContext = `
CURRENT RESUME STATE:
${JSON.stringify(existingResume, null, 2)}

USER INPUT:
"${chatMessage}"

INSTRUCTIONS:
1. Update JSON with any new information provided.
2. IF DATA CHANGED, RETURN MODIFIED FIELDS + WHOLE ARRAYS.
3. GENERATE 'chat_response' that acknowledges changes and asks a follow-up question.
`;

  try {
    const chatSession = modelFlash.startChat({
      history,
      systemInstruction: { role: "system", parts: [{ text: systemInstruction }] }
    });

    const result = await retryGeminiCall(() => chatSession.sendMessage(userContext));
    const responseText = result.response.text();
    return safeParseJSON(responseText);

  } catch (err) {
    console.error("Gemini Chat Error:", err);
    throw new Error("AI Chat failed");
  }
};

exports.analyzeATS = async (resume, jobDescription) => {
  const prompt = `
You are an expert ATS (Applicant Tracking System) Scanner.
Evaluate candidate's resume against job description.

INPUT:
Resume: ${JSON.stringify(resume)}
Job Description: "${jobDescription}"

OUTPUT JSON SCHEMA:
{
  "atsScore": number, // 0-100
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "reasoning": "string"
}
`;

  try {
    const result = await retryGeminiCall(() => modelFlash.generateContent(prompt));
    const responseText = result.response.text();
    return safeParseJSON(responseText);
  } catch (err) {
    console.error("ATS Analysis failed:", err);
    throw new Error("ATS Analysis failed");
  }
};



exports.improveResumeContent = async (resume, targetRole) => {
  const prompt = `
You are a professional resume coach and career advisor.
Analyze the resume below and provide specific, actionable improvement suggestions for the role: "${targetRole || 'Software Developer'}".

RESUME DATA:
${JSON.stringify(resume, null, 2)}

OUTPUT JSON SCHEMA:
{
  "improvedSummary": "string (a rewritten, stronger professional summary)",
  "projectSuggestions": [
    {
      "title": "string",
      "improvedDescription": "string (rewritten with action verbs, metrics, and impact)"
    }
  ],
  "skillSuggestions": ["string (specific skills missing for the target role)"],
  "generalTips": ["string (specific actionable tips for this resume)"]
}
`;

  try {
    const result = await retryGeminiCall(() => modelFlash.generateContent(prompt));
    const responseText = result.response.text();
    return safeParseJSON(responseText);
  } catch (err) {
    console.error("Resume Improvement failed:", err);
    throw new Error("Resume improvement failed");
  }
};

exports.parseResumeText = async (text) => {
  const prompt = `
You are a precise Resume Parser AI.
Goal: Extract structured resume data from the provided text.
Role: Data extraction only.

OUTPUT RULES:
- Return ONLY valid JSON.
- Follow the schema EXACTLY.
- Do NOT add a 'chat_response'.
- Extracted lists (skills, education, etc.) should be substantial.
- If a field is missing, omit it or use empty string/array.

SCHEMA:
{
  "personalDetails": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string"
  },
  "summary": "string",
  "education": [{ "degree": "string", "institute": "string", "year": "string", "score": "string" }],
  "skills": ["string"],
  "projects": [{ "title": "string", "description": "string", "techStack": ["string"] }],
  "experience": [{ "role": "string", "company": "string", "duration": "string", "description": "string" }]
}

RESUME TEXT:
${text}
`;

  try {
    const result = await retryGeminiCall(() => modelFlash.generateContent(prompt));
    const responseText = result.response.text();
    return safeParseJSON(responseText);
  } catch (err) {
    console.error("Resume Parsing failed:", err);
    throw new Error("Resume Parsing failed");
  }
};
