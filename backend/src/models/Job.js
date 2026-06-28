const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    salary: { type: String },
    jobType: { type: String },
    experience: { type: String },
    experienceLevel: {
      type: String,
      enum: ["intern", "fresher", "professional"],
      default: null
    },
    skillsRequired: [{ type: String }],
    applyUrl: { type: String },
    applyLink: { type: String },
    domain: { type: String },
    description: { type: String },

    // metadata
    source: {
      type: String,
      default: "jsearch"
    },
    uniqueJobId: {
      type: String,
      unique: true,
      sparse: true
    },
    hash: {
      type: String,
      unique: true
    },
    postedDate: { type: Date },
    fetchedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes for performance
jobSchema.index({ createdAt: -1 });
jobSchema.index({ source: 1 });

module.exports = mongoose.model("Job", jobSchema);
