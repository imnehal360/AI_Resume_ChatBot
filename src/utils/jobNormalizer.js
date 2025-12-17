
const crypto = require("crypto");

function normalizeJob(job) {
  const title = job.title?.trim();
  const company = job.company?.trim();
  const location = job.location?.trim() || "Unknown";

  const hashSource = `${title}|${company}|${location}`.toLowerCase();

  const hash = crypto
    .createHash("sha256")
    .update(hashSource)
    .digest("hex");

  return {
    ...job,
    title,
    company,
    location,
    hash
  };
}

module.exports = { normalizeJob };
