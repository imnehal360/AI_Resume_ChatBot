const express = require("express");
const router = express.Router();

const { ingestJobsFromJSearch, ingestJobsFromPerplexity } = require("../services/jobIngestion.service");
const { sendDailyDigestToAllUsers } = require("../services/emailDigest.service");

// Simple admin secret middleware
const adminAuth = (req, res, next) => {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: "Forbidden: invalid admin secret" });
  }
  next();
};

// POST /admin/ingest-jobs — fetch remote tech jobs from JSearch (72hr, remote)
router.post("/ingest-jobs", adminAuth, async (req, res) => {
  try {
    const result = await ingestJobsFromJSearch();
    res.json({ message: "JSearch ingestion completed", result });
  } catch (err) {
    console.error("Ingestion error:", err);
    res.status(500).json({ message: "Job ingestion failed", error: err.message });
  }
});

// POST /admin/send-digest — manually trigger email digest to all users
router.post("/send-digest", adminAuth, async (req, res) => {
  try {
    await sendDailyDigestToAllUsers();
    res.json({ message: "Daily digest sent to all eligible users" });
  } catch (err) {
    console.error("Digest error:", err);
    res.status(500).json({ message: "Digest sending failed", error: err.message });
  }
});

// POST /admin/run-pipeline — ingest from JSearch + send digest in one call
router.post("/run-pipeline", adminAuth, async (req, res) => {
  try {
    const result = await ingestJobsFromJSearch();
    await sendDailyDigestToAllUsers();
    res.json({ message: "Full pipeline complete (JSearch + Digest)", ingestion: result });
  } catch (err) {
    console.error("Pipeline error:", err);
    res.status(500).json({ message: "Pipeline failed", error: err.message });
  }
});

module.exports = router;
