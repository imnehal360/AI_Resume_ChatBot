const { fetchRemoteTechJobs } = require("./jsearch.service");
const axios = require("axios");
const crypto = require("crypto");

// Fetch from Perplexity API
async function fetchJobsFromPerplexity(keywords, location) {
  if (!process.env.PERPLEXITY_API_KEY) {
    console.log("[JobSearch] PERPLEXITY_API_KEY missing, skipping Perplexity search.");
    return [];
  }

  console.log(`[JobSearch] Querying Perplexity API for "${keywords}"...`);
  try {
    const prompt = `Find 10 active tech jobs matching keywords "${keywords}" in location "${location || "Remote"}".
Output the results in raw JSON format strictly matching this schema:
[
  {
    "title": "string (required)",
    "company": "string (required)",
    "location": "string",
    "salary": "string or null",
    "jobType": "string",
    "experience": "string",
    "experienceLevel": "intern" or "fresher" or "professional",
    "skillsRequired": ["string"],
    "applyUrl": "string",
    "description": "string",
    "uniqueJobId": "string (unique string identifying this job)",
    "postedDate": "string (ISO Date format or null)"
  }
]
Do NOT write any text or markdown ticks. ONLY output the JSON array.`;

    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    const content = response.data.choices[0].message.content;
    const cleaned = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const jobs = JSON.parse(cleaned);

    if (!Array.isArray(jobs)) return [];

    return jobs.map(j => {
      const cleanTitle = String(j.title || "Job").toLowerCase().trim();
      const cleanCompany = String(j.company || "Company").toLowerCase().trim();
      const hash = crypto.createHash("md5").update(`${cleanTitle}-${cleanCompany}`).digest("hex");

      return {
        title: j.title,
        company: j.company,
        location: j.location || "Remote",
        salary: j.salary || null,
        jobType: j.jobType || "Full-time",
        experience: j.experience || null,
        experienceLevel: j.experienceLevel || "professional",
        skillsRequired: Array.isArray(j.skillsRequired) ? j.skillsRequired : [],
        applyUrl: j.applyUrl || null,
        applyLink: j.applyUrl || null,
        description: j.description || "",
        source: "perplexity",
        uniqueJobId: j.uniqueJobId || `perplexity-${hash}`,
        hash,
        postedDate: j.postedDate ? new Date(j.postedDate) : new Date(),
        fetchedAt: new Date()
      };
    });
  } catch (err) {
    console.error("[JobSearch] Perplexity error:", err.message);
    return [];
  }
}

// Fetch from JSearch API
async function fetchJobsFromJSearch() {
  try {
    const rawJobs = await fetchRemoteTechJobs();
    return rawJobs.map(j => {
      const cleanTitle = String(j.title).toLowerCase().trim();
      const cleanCompany = String(j.company).toLowerCase().trim();
      const hash = crypto.createHash("md5").update(`${cleanTitle}-${cleanCompany}`).digest("hex");

      return {
        title: j.title,
        company: j.company,
        location: j.location,
        salary: j.salary || null,
        jobType: j.jobType || "Full-time",
        experience: j.experience || null,
        experienceLevel: j.experienceLevel,
        skillsRequired: j.skillsRequired || [],
        applyUrl: j.applyUrl,
        applyLink: j.applyUrl,
        description: j.description,
        source: "jsearch",
        uniqueJobId: `jsearch-${hash}`,
        hash,
        postedDate: j.postedDate || new Date(),
        fetchedAt: new Date()
      };
    });
  } catch (err) {
    console.error("[JobSearch] JSearch error:", err.message);
    return [];
  }
}

exports.searchAllJobs = async (keywords = "software developer", location = "Remote") => {
  console.log(`[JobSearch] Starting job search for "${keywords}" in "${location}"...`);

  const jsearchJobs = await fetchJobsFromJSearch();
  const perplexityJobs = await fetchJobsFromPerplexity(keywords, location);

  const allJobs = [...jsearchJobs, ...perplexityJobs];

  // Deduplicate locally by uniqueJobId
  const seenIds = new Set();
  const deduplicated = [];

  for (const job of allJobs) {
    const id = job.uniqueJobId || job.hash;
    if (!seenIds.has(id)) {
      seenIds.add(id);
      deduplicated.push(job);
    }
  }

  console.log(`[JobSearch] Job search complete. Found ${deduplicated.length} total unique jobs.`);
  return deduplicated;
};
