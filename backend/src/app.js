const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const authRoutes = require(path.join(__dirname, "routes", "auth.routes.js"));
const resumeRoutes = require("./routes/resume.routes");
const jobRoutes = require("./routes/job.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();


app.use(helmet());


app.use(cors());

app.use(compression());


app.use(express.json());

// API Route Handlers
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "AI Resume Chatbot API running" });
});

module.exports = app;
