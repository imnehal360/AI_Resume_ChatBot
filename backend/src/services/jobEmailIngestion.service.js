const { google } = require("googleapis");
const { authorize } = require("./gmail.service");
const Job = require("../models/Job");
const ProcessedEmail = require("../models/ProcessedEmail");
const { extractJobsFromText } = require("./ai/jobExtractor.service");
const crypto = require("crypto");

// Find attachment part recursively
function findAttachmentPart(parts) {
  for (const part of parts) {
    if (part.filename === "jobs_payload.json" && part.body?.attachmentId) {
      return part;
    }
    if (part.parts) {
      const nested = findAttachmentPart(part.parts);
      if (nested) return nested;
    }
  }
  return null;
}

// Find plain text part recursively (for fallback parsing)
function findTextPart(parts) {
  for (const part of parts) {
    if (part.mimeType === "text/plain" && part.body?.data) {
      return part;
    }
    if (part.parts) {
      const nested = findTextPart(part.parts);
      if (nested) return nested;
    }
  }
  return null;
}

exports.ingestJobsFromProjectInbox = async () => {
  console.log("[JobEmailIngestion] Starting email ingestion pipeline...");
  const auth = await authorize();
  const gmail = google.gmail({ version: "v1", auth });

  // Query emails matching our pipeline subject
  const q = 'subject:"[Job Ingestion Pipeline] New Jobs Export"';
  const res = await gmail.users.messages.list({
    userId: "me",
    q,
    maxResults: 10
  });

  if (!res.data.messages || res.data.messages.length === 0) {
    console.log("[JobEmailIngestion] No job emails found in inbox.");
    return { processedEmails: 0, insertedJobs: 0, skippedJobs: 0 };
  }

  let processedEmails = 0;
  let insertedJobs = 0;
  let skippedJobs = 0;

  for (const msg of res.data.messages) {
    try {
      // 1. Check if email was already processed in MongoDB
      const isAlreadyProcessed = await ProcessedEmail.findOne({ messageId: msg.id });
      if (isAlreadyProcessed) {
        // Skip silently as it was already handled
        continue;
      }

      console.log(`[JobEmailIngestion] Processing new email ID: ${msg.id}...`);
      const message = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full"
      });

      const parts = message.data.payload.parts || [];
      const attachmentPart = findAttachmentPart(parts);

      let jobs = [];

      if (attachmentPart) {
        console.log(`[JobEmailIngestion] Found JSON attachment in email ${msg.id}. Parsing...`);
        const attachmentData = await gmail.users.messages.attachments.get({
          userId: "me",
          messageId: msg.id,
          id: attachmentPart.body.attachmentId
        });

        const rawJson = Buffer.from(attachmentData.data.data, "base64").toString("utf-8");
        jobs = JSON.parse(rawJson);
      } else {
        console.log(`[JobEmailIngestion] No JSON attachment found in email ${msg.id}. Falling back to AI text extraction...`);
        const textPart = findTextPart(parts) || message.data.payload;
        if (textPart?.body?.data) {
          const bodyText = Buffer.from(textPart.body.data, "base64").toString("utf-8");
          jobs = await extractJobsFromText(bodyText);
        } else {
          console.warn(`[JobEmailIngestion] Could not find text body in email ${msg.id}. Skipping.`);
          continue;
        }
      }

      if (Array.isArray(jobs) && jobs.length > 0) {
        console.log(`[JobEmailIngestion] Processing ${jobs.length} jobs from email ${msg.id}...`);
        for (const rawJob of jobs) {
          try {
            const uniqueId = rawJob.uniqueJobId;
            const applyLink = rawJob.applyLink || rawJob.applyUrl;
            const hash = rawJob.hash;

            const existingJob = await Job.findOne({
              $or: [
                ...(uniqueId ? [{ uniqueJobId: uniqueId }] : []),
                ...(hash ? [{ hash: hash }] : []),
                ...(applyLink ? [{ applyUrl: applyLink }, { applyLink: applyLink }] : [])
              ]
            });

            if (existingJob) {
              skippedJobs++;
              continue;
            }

            const defaultHash = crypto.createHash("md5").update(`${rawJob.title}-${rawJob.company}`).digest("hex");

            await Job.create({
              title: rawJob.title,
              company: rawJob.company,
              location: rawJob.location || "Remote",
              salary: rawJob.salary || null,
              jobType: rawJob.jobType || null,
              experience: rawJob.experience || null,
              experienceLevel: rawJob.experienceLevel || null,
              skillsRequired: rawJob.skillsRequired || [],
              applyUrl: applyLink || null,
              applyLink: applyLink || null,
              domain: rawJob.domain || "Tech",
              description: rawJob.description || "",
              source: rawJob.source || "email-ingested",
              uniqueJobId: uniqueId || `email-${defaultHash}`,
              hash: hash || defaultHash,
              postedDate: rawJob.postedDate ? new Date(rawJob.postedDate) : new Date(),
              fetchedAt: rawJob.fetchedAt || new Date()
            });

            insertedJobs++;
          } catch (jobErr) {
            console.error("[JobEmailIngestion] Error inserting job:", jobErr.message);
          }
        }
      }

      // Mark the message as processed in our DB (instead of modifying Gmail label to bypass scopes issue)
      await ProcessedEmail.create({ messageId: msg.id });
      processedEmails++;
    } catch (msgErr) {
      console.error(`[JobEmailIngestion] Error processing email ID ${msg.id}:`, msgErr.message);
    }
  }

  console.log(`[JobEmailIngestion] Completed: Processed ${processedEmails} emails. Inserted: ${insertedJobs}, Skipped duplicates: ${skippedJobs}`);
  return { processedEmails, insertedJobs, skippedJobs };
};
