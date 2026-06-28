const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const authRoutes = require(path.join(__dirname, "routes", "auth.routes.js"));
const resumeRoutes = require("./routes/resume.routes");
const jobRoutes = require("./routes/job.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// Apply security headers
app.use(helmet());

// Enable CORS for all routes
app.use(cors());

// Enable response compression (Gzip/Brotli)
app.use(compression());

// Parse requests
app.use(express.json());

// API Rate Limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});

// Apply rate limiter to API routes (exclude admin route so cron/admin commands don't hit limits)
app.use("/api", limiter);

// API Route Handlers
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "AI Resume Chatbot API running" });
});

module.exports = app;
