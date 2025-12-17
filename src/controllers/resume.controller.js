const Resume = require("../models/Resume");
const { normalizeResume } = require("../utils/normalize");
const { extractResumeFromChat } = require("../utils/ai");

exports.chatResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    let resume = await Resume.findOne({ userId });
    const existingData = resume ? resume.toObject() : {};

    const extracted = normalizeResume(
      await extractResumeFromChat(message, existingData)
    );

    if (!resume) {
      resume = await Resume.create({ userId, ...extracted });
    } else {
      Object.assign(resume, extracted);
      await resume.save();
    }

    res.json({
      message: "Resume updated using AI",
      resume
    });
  } catch (err) {
    res.status(500).json({
      message: "AI resume extraction failed",
      error: err.message
    });
  }
};



//////////////////////////////////////////////////////////////////////////////

const { improveResumeContent } = require("../utils/ai");

exports.improveResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetRole } = req.body;

    const resume = await Resume.findOne({ userId });
    if (!resume)
      return res.status(404).json({ message: "Resume not found" });

    const feedback = await improveResumeContent(resume, targetRole);

    res.json({
      message: "Resume improvement suggestions generated",
      feedback
    });
  } catch (err) {
    res.status(500).json({
      message: "Resume improvement failed",
      error: err.message
    });
  }
};

////////////////////////////////////////////////////////////////////////////////////


const { calculateATSScore } = require("../utils/ats");

exports.getATSScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required" });
    }

    const resume = await Resume.findOne({ userId });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const atsResult = calculateATSScore(resume, jobDescription);

    resume.atsScore = atsResult.atsScore;
    await resume.save();

    res.json({
      message: "ATS score calculated",
      ...atsResult
    });
  } catch (err) {
    res.status(500).json({
      message: "ATS calculation failed",
      error: err.message
    });
  }
};

