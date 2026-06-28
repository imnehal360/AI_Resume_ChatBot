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

  const jobs = await Job.find({});
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

  // ✅ FILTER AFTER MATCHING (KEY FIX: mapped roles to job experience levels)
  const targetExp = experienceLevel ? experienceLevel.toLowerCase().trim() : null;
  const filtered = targetExp
    ? recommendations.filter(r => {
        if (!r.job.experienceLevel) return false;
        const jobExp = r.job.experienceLevel.toLowerCase().trim();

        if (targetExp === "student") {
          return jobExp === "intern" || jobExp === "fresher";
        }
        if (targetExp === "fresher") {
          return jobExp === "fresher" || jobExp === "intern";
        }
        return jobExp === targetExp;
      })
    : recommendations;

  const final = filtered
    .filter(r => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  return final;
};
