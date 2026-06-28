const Job = require("../models/Job");
const { recommendJobsForUser } = require("../services/jobRecommendation.service");
const { getCache, setCache } = require("../config/redis");

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

exports.getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      title = "",
      location = "",
      experienceLevel = "",
      jobType = "",
      source = "",
      search = ""
    } = req.query;

    // Build Cache Key based on query params
    const cacheKey = `jobs:page=${page}:limit=${limit}:title=${title}:loc=${location}:exp=${experienceLevel}:type=${jobType}:src=${source}:q=${search}`;

    // Try loading from Redis Cache
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      res.setHeader("X-Cache", "HIT");
      return res.json(cachedData);
    }

    const query = {};

    // Specific filters
    if (title) query.title = new RegExp(title, "i");
    if (location) query.location = new RegExp(location, "i");
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (jobType) query.jobType = new RegExp(jobType, "i");
    if (source) query.source = source;

    // Search query match
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { company: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { skillsRequired: new RegExp(search, "i") }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Job.countDocuments(query);

    const responsePayload = {
      jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalJobs: total
      }
    };

    // Store in cache for 12 hours (43200 seconds)
    await setCache(cacheKey, responsePayload, 43200);

    res.setHeader("X-Cache", "MISS");
    return res.json(responsePayload);
  } catch (err) {
    console.error("[JobController] Error fetching jobs:", err.message);
    return res.status(500).json({ message: "Failed to retrieve jobs", error: err.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.json({ job });
  } catch (err) {
    console.error("[JobController] Error fetching job by ID:", err.message);
    return res.status(500).json({ message: "Failed to retrieve job details", error: err.message });
  }
};
