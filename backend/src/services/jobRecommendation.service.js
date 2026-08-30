const Job = require("../models/Job");
const Resume = require("../models/Resume");
const { generateEmbedding, cosineSimilarity } = require("../utils/embedding");

/**
 * Keyword match score calculation (0 to 100)
 */
function calculateKeywordScore(resumeSkills, jobSkills) {
  const safeResumeSkills = Array.isArray(resumeSkills) ? resumeSkills : [];
  const safeJobSkills = Array.isArray(jobSkills) ? jobSkills : [];

  if (safeResumeSkills.length === 0 || safeJobSkills.length === 0) {
    return 0;
  }

  const resumeSet = uniqueSkills(safeResumeSkills);
  const jobSet = uniqueSkills(safeJobSkills);

  let match = 0;
  for (const jobSkill of jobSet) {
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

/**
 * Intelligent Job Recommendation Engine combining Semantic Vector Similarity (70%) + Keyword Match (30%)
 */
exports.recommendJobsForUser = async (userId, experienceLevel) => {
  const resume = await Resume.findOne({ userId });

  if (!resume || !Array.isArray(resume.skills) || resume.skills.length === 0) {
    return [];
  }

  // Ensure candidate has a dense vector embedding (generate on the fly if not cached yet)
  let candidateEmbedding = resume.embedding;
  if (!Array.isArray(candidateEmbedding) || candidateEmbedding.length === 0) {
    const resumeText = `${resume.skills?.join(" ")} ${resume.summary || ""} ${JSON.stringify(resume.experience || [])} ${JSON.stringify(resume.projects || [])}`;
    candidateEmbedding = await generateEmbedding(resumeText);
    if (candidateEmbedding) {
      resume.embedding = candidateEmbedding;
      await resume.save().catch(e => console.warn("[JobRec] Failed saving embedding:", e.message));
    }
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

  const recommendations = [];

  for (const job of jobs) {
    const jobSkills = Array.isArray(job.skillsRequired) ? job.skillsRequired : [];
    
    // 1. Keyword Score (0 - 100)
    const keywordScore = calculateKeywordScore(resumeSkills, jobSkills);

    // 2. Semantic Vector Score (0 - 100)
    let semanticScore = 0;
    if (Array.isArray(candidateEmbedding) && candidateEmbedding.length > 0 && Array.isArray(job.embedding) && job.embedding.length > 0) {
      const similarity = cosineSimilarity(candidateEmbedding, job.embedding);
      // Map cosine similarity (typically 0.3 - 0.9 for related domains) to 0 - 100
      semanticScore = Math.max(0, Math.min(100, Math.round(similarity * 100)));
    }

    // 3. Hybrid Combined Match Score:
    // If semantic embedding is available: 70% Semantic Vector + 30% Keyword
    // If embedding is not yet on job document: Fallback 100% Keyword
    let finalMatchScore = keywordScore;
    if (semanticScore > 0) {
      finalMatchScore = Math.round((0.7 * semanticScore) + (0.3 * keywordScore));
    }

    // Only include relevant jobs with positive match
    if (finalMatchScore > 10 || keywordScore > 0 || semanticScore > 40) {
      recommendations.push({
        job,
        matchScore: finalMatchScore,
        semanticScore,
        keywordScore
      });
    }
  }

  // Sort descending by highest Match Score
  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  return recommendations;
};
