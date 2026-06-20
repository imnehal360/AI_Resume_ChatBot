const axios = require("axios");

const JSEARCH_BASE_URL = "https://jsearch.p.rapidapi.com/search";

// ─── Tech job search queries (ALL types: remote, hybrid, onsite — last 72hr) ──
// 3 queries/day × 30 days = 90 requests/month (well within 200/month free limit)
const TECH_QUERIES = [
  "software developer engineer",
  "frontend backend fullstack developer",
  "mobile developer React Native Flutter",
];

// ─── Determine experience level from job title / description ──────────────────
function detectExperienceLevel(title = "", description = "") {
  const titleLower = title.toLowerCase();
  const descLower  = description.toLowerCase();
  const hasWord    = (text, word) => new RegExp(`\\b${word}\\b`).test(text);

  // ── TITLE has highest priority ────────────────────────────────────────────
  // If the title clearly says "Senior" or "Staff", trust it over description
  if (
    hasWord(titleLower, "senior") ||
    hasWord(titleLower, "lead")   ||
    hasWord(titleLower, "staff")  ||
    hasWord(titleLower, "principal") ||
    hasWord(titleLower, "architect") ||
    hasWord(titleLower, "manager")   ||
    titleLower.includes("sr.")   ||
    titleLower.includes(" sr ")  ||
    titleLower.includes("5+ years") ||
    titleLower.includes("7+ years") ||
    titleLower.match(/\b(ii|iii|iv)\b/) // e.g. "Engineer III"
  ) {
    return "professional";
  }

  if (
    hasWord(titleLower, "intern") ||
    hasWord(titleLower, "internship") ||
    hasWord(titleLower, "trainee")
  ) {
    return "intern";
  }

  if (
    hasWord(titleLower, "junior")  ||
    hasWord(titleLower, "fresher") ||
    titleLower.includes("entry level") ||
    titleLower.includes("entry-level")
  ) {
    return "fresher";
  }

  // ── DESCRIPTION as fallback (lower priority) ─────────────────────────────
  if (
    hasWord(descLower, "intern") ||
    hasWord(descLower, "internship")
  ) {
    return "intern";
  }

  if (
    hasWord(descLower, "junior")  ||
    hasWord(descLower, "fresher") ||
    descLower.includes("entry level") ||
    descLower.includes("entry-level") ||
    descLower.includes("0-1 year") ||
    descLower.includes("no experience required")
  ) {
    return "fresher";
  }

  if (
    hasWord(descLower, "senior")    ||
    hasWord(descLower, "lead")      ||
    hasWord(descLower, "staff")     ||
    hasWord(descLower, "principal") ||
    descLower.includes("5+ years")  ||
    descLower.includes("7+ years")
  ) {
    return "professional";
  }

  // Default: professional (most tech job postings are mid/senior level)
  return "professional";
}

// ─── Extract skills from job required skills array or description ──────────────
function extractSkills(job) {
  // JSearch provides job_required_skills[] when available
  if (
    Array.isArray(job.job_required_skills) &&
    job.job_required_skills.length > 0
  ) {
    return job.job_required_skills.map((s) => String(s).trim()).slice(0, 15);
  }

  // Fallback: scan description for common tech skills
  const description = (job.job_description || "").toLowerCase();
  const knownSkills = [
    "React", "Node.js", "JavaScript", "TypeScript", "Python", "Java",
    "Angular", "Vue.js", "Next.js", "Express", "MongoDB", "PostgreSQL",
    "MySQL", "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP",
    "Git", "REST API", "GraphQL", "HTML", "CSS", "Tailwind", "Bootstrap",
    "Django", "Flask", "Spring Boot", "Go", "Rust", "PHP", "Laravel",
    "Ruby", "Rails", "Swift", "Kotlin", "Flutter", "React Native",
    "CI/CD", "Jenkins", "GitHub Actions", "Terraform", "Linux",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
  ];

  return knownSkills
    .filter((skill) => description.includes(skill.toLowerCase()))
    .slice(0, 15);
}

// ─── Map JSearch result to our Job schema ─────────────────────────────────────
function mapToJobSchema(job) {
  const title = job.job_title || "Unknown Title";
  const company = job.employer_name || "Unknown Company";

  // Show actual location for onsite/hybrid, "Remote" for remote jobs
  let location = "Unknown";
  if (job.job_is_remote) {
    location = "Remote";
  } else if (job.job_city && job.job_country) {
    location = `${job.job_city}, ${job.job_country}`;
  } else if (job.job_city) {
    location = job.job_city;
  } else if (job.job_country) {
    location = job.job_country;
  } else if (job.job_state) {
    location = job.job_state;
  }

  const description = job.job_description || "";
  const experienceLevel = detectExperienceLevel(title, description);
  const skillsRequired = extractSkills(job);
  const applyUrl = job.job_apply_link || job.job_google_link || null;

  return {
    title,
    company,
    location,
    experienceLevel,
    skillsRequired,
    applyUrl,
    description: description.substring(0, 500),
    source: "jsearch",
    domain: "Tech",
  };
}

// ─── Fetch jobs for a single query ────────────────────────────────────────────
async function fetchJobsForQuery(query) {
  const options = {
    method: "GET",
    url: JSEARCH_BASE_URL,
    params: {
      query,
      num_pages: "1",        // 10 results per query
      date_posted: "3days",  // ✅ Jobs posted within last 72 hours
      // No remote_jobs_only — get ALL tech jobs (remote, hybrid, onsite)
    },
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
  };

  const response = await axios.request(options);

  if (!response.data || !Array.isArray(response.data.data)) {
    console.warn(`[JSearch] No results for query: "${query}"`);
    return [];
  }

  return response.data.data;
}

// ─── Main export: fetch all remote tech jobs from last 72 hours ───────────────
exports.fetchRemoteTechJobs = async () => {
  if (!process.env.RAPIDAPI_KEY) {
    throw new Error(
      "RAPIDAPI_KEY is missing in .env — get it free at rapidapi.com/jsearch"
    );
  }

  console.log(`[JSearch] Fetching remote tech jobs (last 72 hours)...`);

  const allRawJobs = [];

  for (const query of TECH_QUERIES) {
    try {
      console.log(`[JSearch] Searching: "${query}"`);
      const results = await fetchJobsForQuery(query);
      allRawJobs.push(...results);
      console.log(`[JSearch] Found ${results.length} results for "${query}"`);

      // Small delay between requests to be polite to the API
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`[JSearch] Error fetching "${query}":`, err.message);
    }
  }

  // Deduplicate by job_id before mapping
  const seen = new Set();
  const uniqueRawJobs = allRawJobs.filter((job) => {
    if (seen.has(job.job_id)) return false;
    seen.add(job.job_id);
    return true;
  });

  const mappedJobs = uniqueRawJobs.map(mapToJobSchema);

  console.log(
    `[JSearch] Total unique jobs fetched: ${mappedJobs.length} across ${TECH_QUERIES.length} queries`
  );

  return mappedJobs;
};
