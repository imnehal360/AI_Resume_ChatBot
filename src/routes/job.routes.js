const express = require("express");
const router = express.Router();
const auth = require("./middleware/auth.middleware");
const { recommendJobs } = require("../controllers/job.controller");
const { recommendJobsForUser } = require("../services/jobRecommendation.service");

router.post("/recommend", auth, recommendJobs);


module.exports = router;
