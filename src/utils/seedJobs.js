const Job = require("../models/Job");

exports.seedJobs = async () => {
  const count = await Job.countDocuments();
  if (count > 0) return;

  await Job.insertMany([
    {
      title: "Full Stack Developer",
      company: "TechNova",
      location: "Remote",
      experienceLevel: "fresher",
      skillsRequired: ["React", "Node.js", "MongoDB", "JavaScript"],
      domain: "Web Development",
      description: "Build and maintain full-stack web applications."
    },
    {
      title: "Frontend Developer Intern",
      company: "UI Labs",
      location: "Bangalore",
      experienceLevel: "intern",
      skillsRequired: ["React", "JavaScript", "HTML", "CSS"],
      domain: "Frontend",
      description: "Work on modern UI components."
    },
    {
      title: "Backend Developer",
      company: "DataStack",
      location: "Remote",
      experienceLevel: "professional",
      skillsRequired: ["Node.js", "Express", "MongoDB"],
      domain: "Backend",
      description: "Develop scalable backend services."
    }
  ]);
};
