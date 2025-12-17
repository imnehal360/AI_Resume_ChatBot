const express = require("express");
const router = express.Router();

const { ingestJobsFromPerplexity } = require("../services/jobIngestion.service");

// OPTIONAL: protect later with admin auth
router.post("/ingest-jobs", async (req, res) => {
  try {
    const result = await ingestJobsFromPerplexity();
    res.json({
      message: "Job ingestion completed",
      result
    });
  } catch (err) {
    console.error("Ingestion error:", err);
    res.status(500).json({
      message: "Job ingestion failed",
      error: err.message
    });
  }
});

module.exports = router;
