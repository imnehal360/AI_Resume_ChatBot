const cron = require("node-cron");
const { searchAllJobs } = require("../services/jobSearch.service");
const { sendJobsToProjectEmail } = require("../services/jobEmailSender.service");
const { ingestJobsFromProjectInbox } = require("../services/jobEmailIngestion.service");

// 1. Scheduled Job Search: Run every 72 hours (every 3rd day at midnight)
cron.schedule("0 0 */3 * *", async () => {
  console.log("[Cron] ⏰ Starting automated job search & email export pipeline (every 72h)...");
  try {
    const jobs = await searchAllJobs("software developer", "Remote");
    console.log(`[Cron] 🔎 Found ${jobs.length} jobs to send.`);
    
    if (jobs.length > 0) {
      await sendJobsToProjectEmail(jobs);
      console.log("[Cron] ✅ Fetch results sent to project email inbox.");
    } else {
      console.log("[Cron] ℹ️ No jobs found. Skipping email sending.");
    }
  } catch (err) {
    console.error("[Cron] ❌ Job search / email pipeline failed:", err.message);
  }
});

// 2. Scheduled Email Ingestion: Run every 12 hours
cron.schedule("0 */12 * * *", async () => {
  console.log("[Cron] ⏰ Starting periodic email inbox ingestion (every 12h)...");
  try {
    const result = await ingestJobsFromProjectInbox();
    console.log(
      `[Cron] ✅ Inbox ingestion complete — Processed emails: ${result.processedEmails}, Inserted jobs: ${result.insertedJobs}, Skipped: ${result.skippedJobs}`
    );
  } catch (err) {
    console.error("[Cron] ❌ Inbox ingestion failed:", err.message);
  }
});

console.log("[Cron] 🚀 Automated Job Ingestion Pipeline schedulers registered.");
console.log("       - Job search & export runs every 72 hours.");
console.log("       - Email inbox ingestion runs every 12 hours.");
