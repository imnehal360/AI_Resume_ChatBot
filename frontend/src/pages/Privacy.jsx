import React from 'react';
import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-12 border-b border-border pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 flex items-center gap-3">
          <Shield size={36} className="text-foreground" /> Privacy Policy
        </h1>
        <p className="text-muted text-sm">
          Last Updated: June 28, 2026
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-8 md:p-10 shadow-sm mb-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <Eye size={20} /> 1. Information We Collect
          </h2>
          <p className="text-muted text-sm leading-relaxed mb-4">
            At ResJo AI, we are committed to protecting your privacy. To provide you with personalized resume building and job matching, we collect the following details:
          </p>
          <ul className="list-disc list-inside text-muted text-sm space-y-2 ml-4">
            <li><strong>Account Information:</strong> Name, email address, password (hashed), and Google Account details (if using Google OAuth).</li>
            <li><strong>Resume Details:</strong> Education, work experience, projects, skills list, and parsed PDF contents.</li>
            <li><strong>Application Data:</strong> Job matching preferences, email digest subscription flags, and chat interaction histories.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <Lock size={20} /> 2. How We Use Your Data
          </h2>
          <p className="text-muted text-sm leading-relaxed mb-4">
            We process your information to deliver and improve our platform features, including:
          </p>
          <ul className="list-disc list-inside text-muted text-sm space-y-2 ml-4">
            <li>Generating AI-driven improvements for your resume using the Gemini API.</li>
            <li>Running calculations to match your skills with remote tech job postings in our database.</li>
            <li>Sending daily personalized job digests directly to your registered email inbox.</li>
            <li>Maintaining conversational history in your AI chat dashboard.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <CheckCircle size={20} /> 3. Data Protection and Third Parties
          </h2>
          <p className="text-muted text-sm leading-relaxed mb-4">
            We store your profile data securely in MongoDB and apply hashing for credential safety. We share data only with necessary third parties strictly for the functional purposes of our app:
          </p>
          <ul className="list-disc list-inside text-muted text-sm space-y-2 ml-4">
            <li><strong>Google API Services:</strong> Used to authenticate user logins and read unread job search reports in the project email pipeline. We adhere to Google API Services User Data Policy restrictions.</li>
            <li><strong>Gemini API:</strong> Processes raw text snippets of your resume for ATS score calculation and structured resume mapping. We do not sell your data.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            4. Your Rights and Deletion
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            You hold full ownership of your data. You can inspect, modify, or permanently delete your profile, uploaded resumes, and account history directly from the Profile tab of our application. If you have any concerns or wish to request data export, feel free to get in touch with our team.
          </p>
        </section>
      </div>

      <div className="text-center text-xs text-muted">
        If you have questions regarding this Privacy Policy, contact us at <a href="mailto:privacy@resjo.ai" className="underline hover:text-foreground">privacy@resjo.ai</a>.
      </div>
    </div>
  );
};

export default Privacy;
