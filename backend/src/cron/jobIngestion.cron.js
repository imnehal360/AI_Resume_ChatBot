const cron = require("node-cron");
const { ingestJobsFromJSearch } = require("../services/jobIngestion.service");

// Scheduled Job Ingestion: Run every 72 hours (every 3rd day at midnight)
cron.schedule("0 0 */3 * *", async () => {
  console.log("[Cron] ⏰ Starting automated JSearch RapidAPI job ingestion pipeline (every 72h)...");
  try {
    const result = await ingestJobsFromJSearch();
    console.log(
      `[Cron] ✅ JSearch ingestion complete — Inserted: ${result.inserted}, Skipped: ${result.skipped}, Errors: ${result.errors}`
    );
  } catch (err) {
    console.error("[Cron] ❌ JSearch job ingestion failed:", err.message);
  }
});

console.log("[Cron] 🚀 Automated JSearch RapidAPI Ingestion Pipeline registered (runs every 72 hours).");
