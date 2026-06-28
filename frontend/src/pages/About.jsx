import React from 'react';
import { Target, Users, Sparkles, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          About ResJo AI
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto">
          We leverage modern artificial intelligence to democratize career building and job matching.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-foreground/5 dark:bg-surface flex items-center justify-center shrink-0 border border-border">
            <Target className="text-foreground" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Our Mission</h3>
            <p className="text-muted text-sm leading-relaxed">
              ResJo AI was created to empower job seekers. We believe everyone deserves access to professional, ATS-optimized resumes and high-quality job matches, free from complex templates or expensive career services.
            </p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-foreground/5 dark:bg-surface flex items-center justify-center shrink-0 border border-border">
            <Sparkles className="text-foreground" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">AI-Powered Ingenuity</h3>
            <p className="text-muted text-sm leading-relaxed">
              Through conversational AI, we guide you step-by-step to extract skills, highlight key project metrics, and write professional summaries. We do the heavy lifting of mapping your expertise into clean data.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-8 md:p-10 mb-16 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Users size={24} /> How it Works
        </h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-foreground text-surface flex items-center justify-center font-bold text-sm shrink-0">
              1
            </div>
            <div>
              <h4 className="font-semibold text-base mb-1">Chat to Build Your Resume</h4>
              <p className="text-muted text-sm">
                Talk to our AI agent to compile your experience, projects, education, and skills. The bot structures this details into a standardized, ATS-parseable layout.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-foreground text-surface flex items-center justify-center font-bold text-sm shrink-0">
              2
            </div>
            <div>
              <h4 className="font-semibold text-base mb-1">Automated Job Ingestion</h4>
              <p className="text-muted text-sm">
                Our backend continuously monitors remote job sources like JSearch and Perplexity, fetching fresh listings every 72 hours and storing them centrally in our database.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-foreground text-surface flex items-center justify-center font-bold text-sm shrink-0">
              3
            </div>
            <div>
              <h4 className="font-semibold text-base mb-1">Personalized Matching & Digests</h4>
              <p className="text-muted text-sm">
                Using skill-based mathematical mapping, we compute a matching score for every active listing against your profile, delivering daily alerts directly to your inbox.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center bg-foreground/5 dark:bg-surface/50 border border-border rounded-2xl p-8">
        <Heart className="mx-auto text-red-500 mb-4 fill-red-500" size={32} />
        <h3 className="text-lg font-bold mb-2">Made for Job Seekers Everywhere</h3>
        <p className="text-muted text-sm max-w-lg mx-auto">
          Whether you are a student looking for internships, a fresher starting out, or a professional aiming for your next senior role, ResJo AI is built to streamline your search.
        </p>
      </div>
    </div>
  );
};

export default About;
