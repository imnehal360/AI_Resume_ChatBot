exports.matchJobs = (resumeSkills, jobs) => {
  const skills = resumeSkills.map(s => s.toLowerCase());

  return jobs
    .map(job => {
      const required = job.skillsRequired.map(s => s.toLowerCase());
      const matched = required.filter(s => skills.includes(s));
      const score = matched.length / (required.length || 1);

      return {
        job,
        score,
        matchedSkills: matched
      };
    })
    .sort((a, b) => b.score - a.score);
};
