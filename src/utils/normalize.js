const INVALID_SKILLS = ["btech", "cse", "mern"];

exports.normalizeResume = (data) => {
  // Normalize skills
  data.skills = (data.skills || [])
    .map(s => s.trim())
    .filter(s => !INVALID_SKILLS.includes(s.toLowerCase()));

  // Normalize projects
  data.projects = (data.projects || []).map(p => ({
    title: capitalize(p.title || ""),
    description:
      p.description && p.description.length > 10
        ? p.description
        : `Developed ${p.title} as a full-stack web application.`,
    techStack: Array.isArray(p.techStack)
      ? [...new Set(p.techStack.filter(t => t.length > 2))]
      : []
  }));

  return data;
};

function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
