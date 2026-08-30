const Job = require("../models/Job");
const { normalizeJob } = require("../utils/jobNormalizer");
const { fetchRemoteTechJobs } = require("./jsearch.service");
const { generateEmbedding } = require("../utils/embedding");

// ─── PRIMARY: Ingest tech jobs from JSearch RapidAPI (72hr fresh) ─────────────
exports.ingestJobsFromJSearch = async () => {
  const rawJobs = await fetchRemoteTechJobs();

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const rawJob of rawJobs) {
    try {
      const job = normalizeJob(rawJob);

      const exists = await Job.findOne({ hash: job.hash });
      if (exists) {
        skipped++;
        continue;
      }

      // Generate semantic embedding from Job description, title, and required skills
      const embeddingText = `${job.title} ${job.skillsRequired?.join(" ")} ${job.description || ""}`.trim();
      const embedding = await generateEmbedding(embeddingText);
      if (embedding) {
        job.embedding = embedding;
      }

      await Job.create(job);
      inserted++;
    } catch (e) {
      // Ignore duplicate key errors (hash unique constraint)
      if (e.code === 11000) {
        skipped++;
      } else {
        console.error("[Ingestion/JSearch] Error inserting job:", e.message);
        errors++;
      }
    }
  }

  console.log(
    `[Ingestion/JSearch] Done — inserted: ${inserted}, skipped: ${skipped}, errors: ${errors}`
  );
  return { inserted, skipped, errors };
};
