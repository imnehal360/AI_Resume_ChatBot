const SKILL_KEYWORDS = [
  "react",
  "node",
  "node.js",
  "nodejs",
  "mongodb",
  "express",
  "javascript",
  "typescript",
  "html",
  "css",
  "rest",
  "api",
  "apis"
];

const normalize = (text) =>
  text.toLowerCase().replace(/[^a-z0-9\s.]/g, "");

exports.calculateATSScore = (resume, jobDescription) => {
  const jdText = normalize(jobDescription);

  // Extract only technical skills from JD
  const jdSkills = SKILL_KEYWORDS.filter(skill =>
    jdText.includes(skill)
  );

  const resumeSkills = resume.skills.map(s =>
    normalize(s)
      .replace("node.js", "node")
      .replace("nodejs", "node")
  );

  let matchedSkills = [];
  let missingSkills = [];

  jdSkills.forEach(skill => {
    const normalizedSkill = skill.replace("node.js", "node");
    if (resumeSkills.includes(normalizedSkill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const atsScore = Math.round(
    (matchedSkills.length / (jdSkills.length || 1)) * 100
  );

  return {
    atsScore,
    matchedSkills,
    missingSkills
  };
};
