const cron = require("node-cron");
const { ingestJobsFromJSearch } = require("../services/jobIngestion.service");
const { sendDailyDigestToAllUsers } = require("../services/emailDigest.service");

// Schedule: Run every day at 8:00 AM
cron.schedule("0 8 * * *", async () => {
  console.log("[Cron] ⏰ Starting daily remote tech job pipeline...");

  try {
    // Step 1: Fetch fresh remote tech jobs from JSearch (last 72 hours)
    const result = await ingestJobsFromJSearch();
    console.log(
      `[Cron] ✅ JSearch ingestion complete — inserted: ${result.inserted}, skipped: ${result.skipped}`
    );

    // Step 2: Send personalized job digest email to all users
    console.log("[Cron] 📧 Sending personalized job digests...");
    await sendDailyDigestToAllUsers();
    console.log("[Cron] ✅ Daily digests sent successfully.");

  } catch (err) {
    console.error("[Cron] ❌ Daily pipeline failed:", err.message);
  }
});

console.log("[Cron] 🚀 Daily remote tech job pipeline scheduled at 8:00 AM.");
