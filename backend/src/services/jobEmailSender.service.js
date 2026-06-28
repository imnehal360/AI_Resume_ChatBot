const nodemailer = require("nodemailer");

function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

exports.sendJobsToProjectEmail = async (jobs) => {
  const targetEmail = process.env.PROJECT_EMAIL || process.env.EMAIL_USER;
  if (!targetEmail) {
    throw new Error("PROJECT_EMAIL or EMAIL_USER is missing in environment variables.");
  }

  console.log(`[JobEmailSender] Sending ${jobs.length} jobs to project email: ${targetEmail}`);

  const transporter = createTransporter();

  // Create human-readable HTML listing
  const htmlJobs = jobs.map((j, i) => `
    <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
      <h3>${i + 1}. ${j.title} at ${j.company}</h3>
      <p><b>Location:</b> ${j.location} | <b>Salary:</b> ${j.salary || "N/A"} | <b>Type:</b> ${j.jobType}</p>
      <p><b>Experience Level:</b> ${j.experienceLevel} | <b>Experience:</b> ${j.experience || "N/A"}</p>
      <p><b>Skills:</b> ${j.skillsRequired.join(", ")}</p>
      <p><b>Apply:</b> <a href="${j.applyUrl}">${j.applyUrl}</a></p>
      <p>${j.description}</p>
    </div>
  `).join("");

  const emailBody = `
    <h2>Job Ingestion Pipeline - Export</h2>
    <p>This email contains ${jobs.length} jobs fetched from the automated search pipeline.</p>
    <hr/>
    ${htmlJobs}
  `;

  // Attach the raw JSON data so ingestion can read it with 100% precision
  const attachments = [
    {
      filename: "jobs_payload.json",
      content: JSON.stringify(jobs, null, 2),
      contentType: "application/json"
    }
  ];

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Job Ingestion Pipeline <${process.env.EMAIL_USER}>`,
    to: targetEmail,
    subject: `[Job Ingestion Pipeline] New Jobs Export - ${jobs.length} jobs`,
    html: emailBody,
    attachments
  });

  console.log("[JobEmailSender] Job email sent successfully.");
};
