const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const { recommendJobs, getJobs, getJobById } = require("../controllers/job.controller");

router.post("/recommend", auth, recommendJobs);
router.get("/", auth, getJobs);
router.get("/:id", auth, getJobById);

module.exports = router;
