const express = require("express");
const router = express.Router();

const { searchAllJobs } = require("../services/jobSearch.service");
const { ingestJobsFromJSearch } = require("../services/jobIngestion.service");
const { sendDailyDigestToAllUsers } = require("../services/emailDigest.service");

// Simple admin secret middleware
const adminAuth = (req, res, next) => {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: "Forbidden: invalid admin secret" });
  }
  next();
};

// POST /admin/search-jobs — test JSearch RapidAPI query
router.post("/search-jobs", adminAuth, async (req, res) => {
  try {
    const { keywords = "software developer", location = "Remote" } = req.body;
    console.log(`[Admin] Triggered manual search for keywords: "${keywords}"`);
    
    const jobs = await searchAllJobs(keywords, location);
    return res.json({
      message: "Job search complete via JSearch RapidAPI.",
      count: jobs.length,
      jobs
    });
  } catch (err) {
    console.error("[Admin] Search failed:", err);
    res.status(500).json({ message: "Search pipeline failed", error: err.message });
  }
});

// POST /admin/ingest-jobs — trigger direct JSearch RapidAPI ingestion into MongoDB
router.post("/ingest-jobs", adminAuth, async (req, res) => {
  try {
    console.log("[Admin] Triggered manual JSearch job ingestion pipeline.");
    const result = await ingestJobsFromJSearch();
    res.json({
      message: "JSearch RapidAPI ingestion completed successfully.",
      result
    });
  } catch (err) {
    console.error("[Admin] JSearch ingestion failed:", err);
    res.status(500).json({ message: "JSearch ingestion failed", error: err.message });
  }
});

// GET /admin/stats — fetch live database stats (total jobs, latest jobs, breakdown by experienceLevel)
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const Job = require("../models/Job");
    const totalJobs = await Job.countDocuments();
    const jsearchJobs = await Job.countDocuments({ source: "jsearch" });
    const latestJobs = await Job.find().sort({ createdAt: -1 }).limit(8);

    const internCount = await Job.countDocuments({ experienceLevel: "intern" });
    const fresherCount = await Job.countDocuments({ experienceLevel: "fresher" });
    const professionalCount = await Job.countDocuments({ experienceLevel: "professional" });

    res.json({
      totalJobs,
      jsearchJobs,
      breakdown: {
        intern: internCount,
        fresher: fresherCount,
        professional: professionalCount
      },
      latestJobs
    });
  } catch (err) {
    console.error("[Admin] Stats retrieval failed:", err);
    res.status(500).json({ message: "Failed to retrieve stats", error: err.message });
  }
});

module.exports = router;
