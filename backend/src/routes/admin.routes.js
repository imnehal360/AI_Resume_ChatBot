const express = require("express");
const router = express.Router();

const { searchAllJobs } = require("../services/jobSearch.service");
const { sendJobsToProjectEmail } = require("../services/jobEmailSender.service");
const { ingestJobsFromProjectInbox } = require("../services/jobEmailIngestion.service");
const { sendDailyDigestToAllUsers } = require("../services/emailDigest.service");

// Simple admin secret middleware
const adminAuth = (req, res, next) => {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: "Forbidden: invalid admin secret" });
  }
  next();
};

// POST /admin/search-and-email — trigger job search and send to project email
router.post("/search-and-email", adminAuth, async (req, res) => {
  try {
    const { keywords = "software developer", location = "Remote" } = req.body;
    console.log(`[Admin] Triggered manual search-and-email pipeline for keywords: "${keywords}"`);
    
    const jobs = await searchAllJobs(keywords, location);
    if (jobs.length > 0) {
      await sendJobsToProjectEmail(jobs);
      return res.json({
        message: "Job search complete, exported to project email.",
        count: jobs.length
      });
    } else {
      return res.json({
        message: "No jobs found during search. No email sent.",
        count: 0
      });
    }
  } catch (err) {
    console.error("[Admin] Search & Email failed:", err);
    res.status(500).json({ message: "Search & Email pipeline failed", error: err.message });
  }
});

// POST /admin/ingest-from-email — read project email and store to MongoDB
router.post("/ingest-from-email", adminAuth, async (req, res) => {
  try {
    console.log("[Admin] Triggered manual email inbox ingestion pipeline.");
    const result = await ingestJobsFromProjectInbox();
    res.json({
      message: "Inbox ingestion completed successfully.",
      result
    });
  } catch (err) {
    console.error("[Admin] Email ingestion failed:", err);
    res.status(500).json({ message: "Email ingestion pipeline failed", error: err.message });
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

module.exports = router;
