const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ["user", "ai"], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    // Optional: tracking specific actions or errors
    action: { type: Object },
});

const chatSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        messages: [messageSchema]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
