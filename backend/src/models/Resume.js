const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    personalDetails: {
      name: String,
      email: String,
      phone: String,
      location: String,
    },

    summary: String,
    education: Array,
    skills: Array,
    projects: Array,
    experience: Array,
    achievements: Array,

    atsScore: Number,

    isPublic: { type: Boolean, default: false },
    shareId: { type: String, unique: true, sparse: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
