import React from 'react';
import { FileText, Award, AlertTriangle, CheckSquare } from 'lucide-react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-12 border-b border-border pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 flex items-center gap-3">
          <FileText size={36} className="text-foreground" /> Terms of Service
        </h1>
        <p className="text-muted text-sm">
          Last Updated: June 28, 2026
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-8 md:p-10 shadow-sm mb-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <CheckSquare size={20} /> 1. Acceptance of Terms
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            By creating an account or accessing ResJo AI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must immediately discontinue using our application.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <Award size={20} /> 2. Use of the Service
          </h2>
          <p className="text-muted text-sm leading-relaxed mb-4">
            ResJo AI provides resume parsing, ATS scoring, and automated job matching for personal career development. By using this service, you agree that:
          </p>
          <ul className="list-disc list-inside text-muted text-sm space-y-2 ml-4">
            <li>You will not upload fraudulent, obscene, or copyright-violating resume texts.</li>
            <li>You will not attempt to bypass API rate limits, scrape database jobs, or abuse the automated Gmail ingestion system.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <AlertTriangle size={20} className="text-amber-500" /> 3. Disclaimers and AI Limitations
          </h2>
          <p className="text-muted text-sm leading-relaxed mb-4">
            Our tool utilizes large language models (such as Google Gemini and Llama) to structure resumes and suggest recommendations.
          </p>
          <ul className="list-disc list-inside text-muted text-sm space-y-2 ml-4">
            <li><strong>No Guarantee of Accuracy:</strong> Matching scores and ATS indicators are suggestions. We do not guarantee they reflect exact recruiter screening criteria.</li>
            <li><strong>Third-Party Listings:</strong> Jobs fetched from JSearch and Perplexity are hosted on external sites. We are not responsible for their contents, validity, or interview policies. You apply at your own discretion.</li>
            <li><strong>Service Availability:</strong> We provide the application on an "as-is" basis and do not warrant uninterrupted uptime.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            4. Limitation of Liability
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            In no event shall ResJo AI, its developer, or affiliates be liable for any indirect, incidental, special, or consequential damages (including loss of employment opportunities or interview call-backs) arising out of your use or inability to use the platform.
          </p>
        </section>
      </div>

      <div className="text-center text-xs text-muted">
        If you have questions regarding these Terms, contact us at <a href="mailto:support@resjo.ai" className="underline hover:text-foreground">support@resjo.ai</a>.
      </div>
    </div>
  );
};

export default Terms;
