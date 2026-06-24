const Resume = require("../models/Resume");
const Chat = require("../models/Chat");
const { normalizeResume } = require("../utils/normalize");
const { extractResumeFromChat, analyzeATS, parseResumeText } = require("../utils/ai");

const { recommendJobsForUser } = require("../services/jobRecommendation.service");
const { parseResumePdf } = require("../services/resumeParser.service");

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;
    const pdfText = await parseResumePdf(req.file.buffer);

    // Use specialized Parser AI function instead of Chat AI
    // limit char count to 20k to fit context window
    const extractedData = await parseResumeText(pdfText.substring(0, 20000));
    const extracted = normalizeResume(extractedData);

    let resume = await Resume.findOne({ userId });

    if (!resume) {
      resume = new Resume({ userId, ...extracted });
    } else {
      if (extracted.personalDetails) {
        resume.personalDetails = { ...resume.personalDetails, ...extracted.personalDetails };
        delete extracted.personalDetails;
      }
      Object.assign(resume, extracted);
    }

    // Default response since we aren't using the chat engine
    const aiResponseText = "I've successfully uploaded and parsed your resume. Your profile is now updated!";

    // Skills merge
    const newSkills = extracted.skills || [];
    const oldSkills = resume.skills || [];
    const mergedSkills = [...new Set([...oldSkills, ...newSkills].map(s => String(s).trim()))];
    resume.skills = mergedSkills;

    await resume.save();

    // Update chat history
    let chat = await Chat.findOne({ userId });
    if (!chat) chat = new Chat({ userId, messages: [] });
    chat.messages.push({ role: "user", text: "[Uploaded Resume PDF]" });
    chat.messages.push({ role: "ai", text: aiResponseText });
    await chat.save();

    res.json({
      message: "Resume uploaded and processed",
      resume,
      chatResponse: { text: aiResponseText }
    });

  } catch (err) {
    console.error("Resume upload error:", err);
    res.status(500).json({ message: "Failed to process resume", error: err.message });
  }
};

exports.chatResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    let resume = await Resume.findOne({ userId });
    const existingData = resume ? resume.toObject() : {};

    // Fetch chat history for context (last 5 messages)
    let chat = await Chat.findOne({ userId });
    const chatHistory = chat ? chat.messages.slice(-5) : [];

    const extracted = normalizeResume(
      await extractResumeFromChat(message, existingData, chatHistory)
    );
    console.log("DEBUG: AI Extracted Data:", JSON.stringify(extracted, null, 2));

    if (!resume) {
      resume = new Resume({ userId, ...extracted });
    } else {
      // Deep merge personalDetails if present and not empty
      if (extracted.personalDetails) {
        resume.personalDetails = {
          ...resume.personalDetails,
          ...extracted.personalDetails
        };
      }

      // Update basic fields if they are provided and non-empty
      if (extracted.summary) {
        resume.summary = extracted.summary;
      }
      if (typeof extracted.atsScore === "number") {
        resume.atsScore = extracted.atsScore;
      }

      // Update arrays ONLY if they have items (otherwise preserve existing arrays)
      if (extracted.skills && extracted.skills.length > 0) {
        resume.skills = extracted.skills;
      }
      if (extracted.experience && extracted.experience.length > 0) {
        resume.experience = extracted.experience;
      }
      if (extracted.projects && extracted.projects.length > 0) {
        resume.projects = extracted.projects;
      }
      if (extracted.education && extracted.education.length > 0) {
        resume.education = extracted.education;
      }
      if (extracted.achievements && extracted.achievements.length > 0) {
        resume.achievements = extracted.achievements;
      }
    }

    // Capture the AI's chat response BEFORE we delete it from the object
    const aiResponseText = extracted.chat_response || "I've updated your resume with that information. What else would you like to add?";

    // Remove non-schema fields before saving (like chat_response)
    if (resume.chat_response) delete resume.chat_response;
    if (extracted.chat_response) delete extracted.chat_response;

    await resume.save();

    // --- Chat History Logic ---
    if (!chat) {
      chat = new Chat({ userId, messages: [] });
    }

    // 1. Save User Message
    chat.messages.push({ role: "user", text: message });

    // 2. Save AI Message
    chat.messages.push({
      role: "ai",
      text: aiResponseText
    });

    await chat.save();

    res.json({
      message: "Resume updated using AI",
      resume,
      chatResponse: {
        text: aiResponseText
      }
    });

  } catch (err) {
    // Optionally save error message to chat history?
    // For now just return error
    res.status(500).json({
      message: "AI resume extraction failed",
      error: err.message
    });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const chat = await Chat.findOne({ userId });
    res.json({ messages: chat ? chat.messages : [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chat history", error: err.message });
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

    // Try AI analysis first
    let atsResult;
    try {
      atsResult = await analyzeATS(resume, jobDescription);
    } catch (aiError) {
      console.error("AI ATS Analysis failed, falling back to static:", aiError.message);
      // Fallback to static
      atsResult = calculateATSScore(resume, jobDescription);
    }

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

exports.getResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const resume = await Resume.findOne({ userId });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json({ resume });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch resume", error: err.message });
  }
};

