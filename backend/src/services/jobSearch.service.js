const { fetchRemoteTechJobs } = require("./jsearch.service");
const crypto = require("crypto");

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
  console.log(`[JobSearch] Starting job search for "${keywords}" in "${location}" via JSearch RapidAPI...`);

  const jsearchJobs = await fetchJobsFromJSearch();

  // Deduplicate locally by uniqueJobId / hash
  const seenIds = new Set();
  const deduplicated = [];

  for (const job of jsearchJobs) {
    const id = job.uniqueJobId || job.hash;
    if (!seenIds.has(id)) {
      seenIds.add(id);
      deduplicated.push(job);
    }
  }

  console.log(`[JobSearch] Job search complete. Found ${deduplicated.length} total unique jobs from JSearch.`);
  return deduplicated;
};
