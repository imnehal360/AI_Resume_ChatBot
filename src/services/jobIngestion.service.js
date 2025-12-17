const Job = require("../models/Job");
const { normalizeJob } = require("../utils/jobNormalizer");
const { fetchPerplexityEmails } = require("./gmail.service");
const { extractJobsFromText } = require("./ai/jobExtractor.service");

exports.ingestJobsFromPerplexity = async () => {
  const emails = await fetchPerplexityEmails();

  let inserted = 0;
  let skipped = 0;

  for (const emailText of emails) {
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
  }

  return { inserted, skipped };
};
