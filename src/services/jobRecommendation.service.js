const Job = require("../models/Job");
const Resume = require("../models/Resume");

function calculateMatchScore(resumeSkills, jobSkills) {
  const safeResumeSkills = Array.isArray(resumeSkills) ? resumeSkills : [];
  const safeJobSkills = Array.isArray(jobSkills) ? jobSkills : [];

  if (safeResumeSkills.length === 0 || safeJobSkills.length === 0) {
    return 0;
  }

  const resumeSet = new Set(
    safeResumeSkills.map(s => String(s).toLowerCase())
  );

  const jobSet = new Set(
    safeJobSkills.map(s => String(s).toLowerCase())
  );

  let match = 0;
  for (const skill of jobSet) {
    if (resumeSet.has(skill)) match++;
  }

  return Math.round((match / jobSet.size) * 100);
}

exports.recommendJobsForUser = async (userId) => {
  const resume = await Resume.findOne({ userId });

  if (!resume) {
    return [];
  }

  const resumeSkills = Array.isArray(resume.skills) ? resume.skills : [];

  const jobs = await Job.find();
  if (!Array.isArray(jobs)) {
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

  return recommendations
    .filter(r => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
};
