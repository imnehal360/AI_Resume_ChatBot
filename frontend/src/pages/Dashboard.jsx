import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Briefcase, BarChart, CheckCircle, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [atsScore, setAtsScore] = useState(null);
    const [jdInput, setJdInput] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [atsError, setAtsError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoadingJobs(true);
            // Optional experienceLevel param can be added later
            const res = await api.post('/jobs/recommend', {});
            setJobs(res.data.recommendations || []);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoadingJobs(false);
        }
    };

    const handleATSAnalysis = async () => {
        if (!jdInput.trim()) return;
        try {
            setAnalyzing(true);
            setAtsError('');
            const res = await api.post('/resume/ats', { jobDescription: jdInput });
            setAtsScore(res.data);
        } catch (error) {
            console.error("ATS Analysis failed", error);
            setAtsError(error.response?.data?.message || "Analysis failed");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="space-y-10">
            <header>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted">Welcome back, {user?.email?.split('@')[0]}</p>
            </header>

            {/* Job Recommendations Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Briefcase size={22} /> Recommended Jobs
                    </h2>
                    <button
                        onClick={fetchJobs}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Refresh Jobs"
                    >
                        <RefreshCw size={18} className={loadingJobs ? "animate-spin" : ""} />
                    </button>
                </div>

                {loadingJobs ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : jobs.length > 0 ? (
                    <>
                        {/* Scroll indicator */}
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-500">
                                Showing <span className="font-semibold text-gray-800">{Math.min(8, jobs.length)}</span> of <span className="font-semibold text-gray-800">{jobs.length}</span> matched jobs
                            </span>
                            {jobs.length > 8 && (
                                <span className="text-xs text-gray-400 italic">Scroll to see all</span>
                            )}
                        </div>

                        {/* Scrollable job list — max 8 visible */}
                        <div
                            className="space-y-3 overflow-y-auto pr-1"
                            style={{ maxHeight: '520px' }}
                        >
                            {jobs.slice(0, 8).map((job, idx) => (
                                <div key={idx} className="bg-surface p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-4">
                                    {/* Match badge */}
                                    <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center flex-col"
                                        style={{ background: job.matchScore >= 80 ? '#f0fdf4' : job.matchScore >= 50 ? '#fefce8' : '#fff1f2' }}>
                                        <span className={`text-lg font-black leading-none ${job.matchScore >= 80 ? 'text-green-600' : job.matchScore >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                                            {Math.round(job.matchScore)}%
                                        </span>
                                        <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wide">match</span>
                                    </div>

                                    {/* Job info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base leading-snug line-clamp-1">{job.title}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{job.company} &bull; {job.location}</p>
                                        <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                                            {job.experienceLevel}
                                        </span>
                                    </div>

                                    {/* Apply button */}
                                    {job.applyUrl && (
                                        <a
                                            href={job.applyUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="shrink-0 bg-foreground text-surface px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                                        >
                                            Apply <ExternalLink size={13} />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="bg-surface p-10 rounded-xl border border-border text-center">
                        <Briefcase className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-gray-500">No job recommendations found yet. Try updating your resume!</p>
                    </div>
                )}
            </section>

            {/* ATS Scanner Section */}
            <section className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border bg-gray-50 flex items-center gap-2">
                    <BarChart size={22} />
                    <h2 className="font-bold text-lg">ATS Compatibility Scanner</h2>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Paste Job Description</label>
                            <textarea
                                className="w-full h-48 p-4 border border-border rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                                placeholder="Paste the job description here to check your compatibility..."
                                value={jdInput}
                                onChange={(e) => setJdInput(e.target.value)}
                            ></textarea>
                        </div>
                        <button
                            onClick={handleATSAnalysis}
                            disabled={analyzing || !jdInput.trim()}
                            className="bg-foreground text-surface px-6 py-2 rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {analyzing ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                            Analyze Match
                        </button>
                        {atsError && (
                            <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14} /> {atsError}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-center bg-gray-50 rounded-lg p-6 border border-dashed border-gray-200">
                        {atsScore ? (
                            <div className="w-full">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-xl">Match Result</h3>
                                    <div className="text-3xl font-black">{atsScore.atsScore}%</div>
                                </div>

                                {/* Simulated Analysis Details - since backend only returns score? Verify backend. */}
                                {/* Backend returns { message, atsScore, missingSkills?, matchedSkills? } */}
                                {/* Let's verify backend atsResult structure from resume.controller.js -> utils/ats.js */}

                                <div className="space-y-3">
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-foreground h-3 rounded-full transition-all duration-1000"
                                            style={{ width: `${atsScore.atsScore}%` }}
                                        ></div>
                                    </div>

                                    {atsScore.missingSkills && atsScore.missingSkills.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-bold text-red-600 mb-2">Missing Skills:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {atsScore.missingSkills.map((skill, i) => (
                                                    <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-100">{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {atsScore.matchedSkills && atsScore.matchedSkills.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-bold text-green-600 mb-2">Matched Skills:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {atsScore.matchedSkills.map((skill, i) => (
                                                    <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-100">{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400">
                                <BarChart size={48} className="mx-auto mb-2 opacity-20" />
                                <p>Result will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
