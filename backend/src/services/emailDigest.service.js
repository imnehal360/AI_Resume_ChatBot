const nodemailer = require("nodemailer");
const User = require("../models/User");
const { recommendJobsForUser } = require("./jobRecommendation.service");

// ─── Nodemailer transporter using Gmail App Password ───────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Gmail App Password (16 chars)
    }
  });
}

// ─── Build HTML email template ─────────────────────────────────────────────────
function buildEmailHTML(userName, jobs) {
  const jobCards = jobs
    .slice(0, 10)
    .map(
      ({ job, matchScore }) => `
      <div style="background:#1e1e2e;border:1px solid #313244;border-radius:12px;padding:20px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;">
          <div>
            <h3 style="margin:0 0 4px;color:#cdd6f4;font-size:16px;">${job.title}</h3>
            <p style="margin:0 0 8px;color:#a6adc8;font-size:14px;">🏢 ${job.company} &nbsp;|&nbsp; 📍 ${job.location || "Remote"}</p>
          </div>
          <div style="background:#313244;border-radius:20px;padding:4px 14px;text-align:center;min-width:60px;">
            <span style="color:#a6e3a1;font-weight:700;font-size:15px;">${matchScore}%</span>
            <p style="margin:0;color:#6c7086;font-size:10px;">match</p>
          </div>
        </div>
        ${job.experienceLevel ? `<span style="background:#45475a;color:#cba6f7;border-radius:6px;padding:2px 10px;font-size:12px;">${job.experienceLevel}</span>` : ""}
        ${job.skillsRequired?.length ? `<p style="margin:10px 0 0;color:#6c7086;font-size:13px;">🛠 ${job.skillsRequired.slice(0, 6).join(", ")}</p>` : ""}
        ${job.applyUrl ? `
        <a href="${job.applyUrl}" style="display:inline-block;margin-top:12px;background:linear-gradient(135deg,#89b4fa,#cba6f7);color:#1e1e2e;padding:8px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">
          Apply Now →
        </a>` : ""}
      </div>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your Daily Job Digest</title>
</head>
<body style="margin:0;padding:0;background:#11111b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="background:linear-gradient(135deg,#89b4fa,#cba6f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px;font-weight:800;margin-bottom:4px;">
        🤖 AI Resume Bot
      </div>
      <h1 style="color:#cdd6f4;font-size:22px;margin:8px 0 4px;">Your Daily Job Digest</h1>
      <p style="color:#6c7086;font-size:14px;margin:0;">
        Good morning, ${userName}! Here are today's top job matches based on your skills.
      </p>
    </div>

    <!-- Stats bar -->
    <div style="background:#1e1e2e;border-radius:12px;padding:16px 24px;margin-bottom:24px;text-align:center;">
      <span style="color:#a6adc8;font-size:14px;">
        🎯 <strong style="color:#cdd6f4;">${jobs.length}</strong> jobs matched your profile today
      </span>
    </div>

    <!-- Job Cards -->
    ${jobCards || `<p style="color:#6c7086;text-align:center;">No job matches found today. Make sure your resume has skills listed!</p>`}

    <!-- Footer -->
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #313244;text-align:center;">
      <p style="color:#585b70;font-size:12px;margin:0;">
        You're receiving this because you have daily job alerts enabled.<br>
        Visit your profile to manage notification preferences.
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ─── Send digest to a single user ─────────────────────────────────────────────
async function sendDigestToUser(user) {
  try {
    const recommendations = await recommendJobsForUser(user._id, user.role);

    if (!recommendations || recommendations.length === 0) {
      console.log(`[EmailDigest] No matches for ${user.email} — skipping`);
      return;
    }

    const transporter = createTransporter();
    const html = buildEmailHTML(user.name, recommendations);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `AI Resume Bot <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `🎯 ${recommendations.length} Job Matches Found For You Today!`,
      html
    });

    console.log(`[EmailDigest] ✅ Sent to ${user.email} (${recommendations.length} jobs)`);
  } catch (err) {
    console.error(`[EmailDigest] ❌ Failed for ${user.email}:`, err.message);
  }
}

// ─── Send digest to ALL eligible users ────────────────────────────────────────
exports.sendDailyDigestToAllUsers = async () => {
  const users = await User.find({ emailNotifications: true });

  if (!users.length) {
    console.log("[EmailDigest] No users with email notifications enabled.");
    return;
  }

  console.log(`[EmailDigest] Sending digest to ${users.length} users...`);

  // Send sequentially to avoid SMTP rate limiting
  for (const user of users) {
    await sendDigestToUser(user);
  }

  console.log("[EmailDigest] ✅ All digests sent.");
};

// ─── Export single-user sender for manual/admin triggers ──────────────────────
exports.sendDigestToUser = sendDigestToUser;
