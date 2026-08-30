const Job = require("../models/Job");
const Resume = require("../models/Resume");

function calculateMatchScore(resumeSkills, jobSkills) {
  const safeResumeSkills = Array.isArray(resumeSkills) ? resumeSkills : [];
  const safeJobSkills = Array.isArray(jobSkills) ? jobSkills : [];

  if (safeResumeSkills.length === 0 || safeJobSkills.length === 0) {
    return 0;
  }

  const resumeSet = uniqueSkills(safeResumeSkills);
  const jobSet = uniqueSkills(safeJobSkills);

  let match = 0;
  for (const jobSkill of jobSet) {
    // Check if any resume skill partially matches the job skill (or vice versa)
    const isMatch = [...resumeSet].some(resumeSkill =>
      resumeSkill.includes(jobSkill) || jobSkill.includes(resumeSkill)
    );
    if (isMatch) match++;
  }

  return Math.round((match / jobSet.size) * 100);
}

function uniqueSkills(skills) {
  return new Set(skills.map(s => String(s).toLowerCase().trim()));
}

exports.recommendJobsForUser = async (userId, experienceLevel) => {
  const resume = await Resume.findOne({ userId });

  if (!resume || !Array.isArray(resume.skills) || resume.skills.length === 0) {
    return [];
  }

  const resumeSkills = resume.skills;

  // Build MongoDB query filter based on mapped experienceLevel
  const query = {};
  const targetExp = experienceLevel ? experienceLevel.toLowerCase().trim() : null;

  if (targetExp) {
    if (targetExp === "student") {
      query.experienceLevel = { $in: ["intern", "fresher"] };
    } else if (targetExp === "fresher") {
      query.experienceLevel = { $in: ["fresher", "intern"] };
    } else {
      query.experienceLevel = targetExp;
    }
  }

  const jobs = await Job.find(query);
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return [];
  }

  const recommendations = jobs.map(job => {
    const jobSkills = Array.isArray(job.skillsRequired)
      ? job.skillsRequired
      : [];

    const score = calculateMatchScore(resumeSkills, jobSkills);

    return {
      job,
      matchScore: score
    };
  });

  const final = recommendations
    .filter(r => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  return final;
};
