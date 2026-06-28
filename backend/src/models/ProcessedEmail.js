const mongoose = require("mongoose");

const processedEmailSchema = new mongoose.Schema(
  {
    messageId: { type: String, required: true, unique: true },
    processedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProcessedEmail", processedEmailSchema);
