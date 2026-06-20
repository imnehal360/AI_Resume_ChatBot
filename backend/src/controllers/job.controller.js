const { recommendJobsForUser } = require("../services/jobRecommendation.service");

exports.recommendJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { experienceLevel } = req.body;

    const recommendations = await recommendJobsForUser(
      userId,
      experienceLevel
    );

    return res.json({
      message: "Job recommendations generated",
      recommendations: recommendations.slice(0, 50).map(r => ({
        title: r.job.title,
        company: r.job.company,
        location: r.job.location,
        experienceLevel: r.job.experienceLevel,
        matchScore: r.matchScore,
        applyUrl: r.job.applyUrl || null
      }))
    });
  } catch (err) {
    console.error("Job recommendation error:", err);
    return res.status(500).json({
      message: "Job recommendation failed",
      error: err.message
    });
  }
};
