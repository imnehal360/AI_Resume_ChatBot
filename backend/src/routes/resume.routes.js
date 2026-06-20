const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const { chatResume, improveResume, getATSScore, getResume, getChatHistory, uploadResume } = require("../controllers/resume.controller");

router.post("/chat", auth, chatResume);
router.post("/upload", auth, upload.single("resume"), uploadResume); // New Route
router.get("/chat/history", auth, getChatHistory);
router.get("/", auth, getResume);
router.post("/improve", auth, improveResume);
router.post("/ats", auth, getATSScore);


module.exports = router;
