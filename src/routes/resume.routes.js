const express = require("express");
const router = express.Router();
const auth = require("./middleware/auth.middleware");

const { chatResume, improveResume, getATSScore } = require("../controllers/resume.controller");

router.post("/chat", auth, chatResume);
router.post("/improve", auth, improveResume);
router.post("/ats", auth, getATSScore);


module.exports = router;
