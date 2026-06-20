const Job = require("../models/Job");
const { normalizeJob } = require("../utils/jobNormalizer");
const { fetchPerplexityEmails } = require("./gmail.service");
const { extractJobsFromText } = require("./ai/jobExtractor.service");
const { fetchRemoteTechJobs } = require("./jsearch.service");

// ─── PRIMARY: Ingest remote tech jobs from JSearch API (72hr fresh) ───────────
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

// ─── LEGACY: Ingest jobs from Perplexity emails (Gmail-based) ─────────────────
exports.ingestJobsFromPerplexity = async () => {
  const emails = await fetchPerplexityEmails();

  let inserted = 0;
  let skipped = 0;

  for (const emailText of emails) {
    try {
      const extractedJobs = await extractJobsFromText(emailText);

      for (const rawJob of extractedJobs) {
        const job = normalizeJob(rawJob);

        const exists = await Job.findOne({ hash: job.hash });
        if (exists) {
          skipped++;
          continue;
        }

        await Job.create(job);
        inserted++;
      }
    } catch (e) {
      console.error("[Ingestion/Perplexity] Error processing email:", e.message);
    }
  }

  return { inserted, skipped };
};
