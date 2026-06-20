import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Loader2, Briefcase, MapPin, Building, Trophy, ExternalLink } from 'lucide-react';
import './JobRecommendations.css';

const JobRecommendations = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Determine experience level logic if needed, or just let backend decide based on resume
                // For now, sending matches based on resume is the default behavior of the endpoint
                const res = await api.post('/jobs/recommend', {});
                setJobs(res.data.recommendations || []);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
                setError("Could not load job recommendations.");
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    if (loading) {
        return (
            <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
                <Loader2 className="animate-spin text-black" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[calc(100vh-6rem)] flex items-center justify-center text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-black text-white rounded-lg">
                    <Briefcase size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Recommended Jobs</h1>
                    <p className="text-gray-500">Positions matching your resume skills and experience</p>
                </div>
            </div>

            {jobs.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No matches found yet</h3>
                    <p className="mt-1 text-gray-500">Update your resume with more skills to get recommendations.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job, idx) => (
                        <div
                            key={idx}
                            className="forced-square-card bg-white rounded-xl border border-gray-200 shadow-lg p-6 cursor-pointer"
                        >
                            <div className="overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                                        <Building size={20} className="text-gray-700" />
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold shrink-0 ${job.matchScore >= 80 ? 'bg-green-100 text-green-700' :
                                        job.matchScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {job.matchScore}% Match
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{job.title}</h3>
                                <p className="text-gray-600 font-medium mb-4 truncate">{job.company}</p>

                                <div className="space-y-2 mb-6 flex-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <MapPin size={16} className="shrink-0" />
                                        <span className="truncate">{job.location || 'Remote'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Trophy size={16} className="shrink-0" />
                                        <span className="truncate">{job.experienceLevel || 'Not specified'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions area docked to bottom */}
                            {job.applyUrl ? (
                                <a
                                    href={job.applyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors mt-auto shadow-md"
                                >
                                    Apply Now
                                </a>
                            ) : (
                                <button disabled className="w-full bg-gray-100 text-gray-400 py-3 rounded-lg cursor-not-allowed mt-auto">
                                    Apply Not Available
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobRecommendations;
