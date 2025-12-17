// Placeholder AI logic for now
// Later you can plug OpenAI / Gemini / Groq here

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

exports.extractResumeFromChat = async (chatMessage, existingResume = {}) => {
  const prompt = `
You are an expert AI resume parser.

Your task is to convert the USER MESSAGE into a STRICTLY VALID JSON resume object.

CRITICAL RULES:
- Output ONLY valid JSON (no text, no explanation)
- Follow the EXACT schema below
- Do NOT simplify arrays into strings
- Expand compound skills like "MERN stack" into individual skills
- Each project MUST be an object (not string)
- If information is missing, return empty arrays
- Do NOT hallucinate degrees, companies, years, or metrics
- Merge with existing resume data if present

ADDITIONAL RULES:
- Do NOT include degrees or branches as skills
- Do NOT include "MERN" as a skill; expand it instead
- Each project description should sound professional

STRICT JSON SCHEMA:
{
  "summary": "",
  "education": [
    {
      "degree": "",
      "institute": "",
      "year": "",
      "score": ""
    }
  ],
  "skills": [],
  "projects": [
    {
      "title": "",
      "description": "",
      "techStack": []
    }
  ],
  "experience": [
    {
      "role": "",
      "company": "",
      "duration": "",
      "description": ""
    }
  ],
  "achievements": []
}

EXISTING RESUME DATA:
${JSON.stringify(existingResume)}

USER MESSAGE:
"${chatMessage}"
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });

  const responseText = completion.choices[0].message.content;

  return JSON.parse(responseText);
};


exports.improveResumeContent = async (resume, targetRole) => {
  return {
    improvedSummary: resume.summary
      ? `Improved: ${resume.summary}`
      : "Add a strong professional summary aligned with the role.",

    projectSuggestions: resume.projects?.map((p) => ({
      title: p.title,
      improvedDescription: `Enhanced impact-driven description for ${p.title}`
    })) || [],

    skillSuggestions: [
      "Use more role-specific skills",
      "Add measurable outcomes",
      "Use strong action verbs"
    ]
  };
};
