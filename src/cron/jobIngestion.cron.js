const cron = require("node-cron");
const { ingestJobsFromPerplexity } = require("../services/jobIngestion.service");

cron.schedule("0 9 * * *", async () => {
  try {
    console.log("⏰ Running daily job ingestion...");
    const result = await ingestJobsFromPerplexity();
    console.log("✅ Job ingestion completed:", result);
  } catch (err) {
    console.error("❌ Job ingestion failed", err);
  }
});
