import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    User, Mail, Phone, MapPin, Briefcase, GraduationCap,
    Code, Award, UserCheck, Star, PenTool, Sparkles, AlertCircle
} from 'lucide-react';

const PublicProfile = () => {
    const { shareId } = useParams();
    const navigate = useNavigate();
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPublicResume = async () => {
            try {
                const res = await api.get(`/resume/public/${shareId}`);
                setResume(res.data.resume);
            } catch (err) {
                console.error("Failed to fetch public resume profile", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (shareId) {
            fetchPublicResume();
        } else {
            setError(true);
            setLoading(false);
        }
    }, [shareId]);

    // Calculate Total Experience Helper
    const totalExperience = useMemo(() => {
        if (!resume?.experience?.length) return 0;
        return resume.experience.length;
    }, [resume]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                    <div className="w-48 h-6 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (error || !resume) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Profile Not Found or Private</h2>
                <p className="text-gray-500 mb-6 max-w-md">
                    The profile you are trying to access does not exist, or the owner has disabled public link sharing.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-black text-white px-6 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                >
                    Go to Homepage
                </button>
            </div>
        );
    }

    // Dicebear avatar using name fallback
    const avatarName = resume.personalDetails?.name || "Professional";
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${avatarName}`;

    return (
        <div className="min-h-screen bg-gray-50/30 p-4 md:p-8 animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-bl-[100px] -z-0 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>

                    <div className="relative z-10 w-32 h-32 rounded-full p-1 bg-gray-100 shadow-lg">
                        <img
                            src={avatarUrl}
                            alt="Profile"
                            className="w-full h-full rounded-full bg-white object-cover border-4 border-white"
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left relative z-10">
                        <h1 className="text-4xl font-bold mb-2 text-gray-900">
                            {resume.personalDetails?.name || "Professional Profile"}
                        </h1>
                        <p className="text-xl text-gray-500 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                            {resume.experience?.[0]?.role || "Aspiring Professional"}
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
                            {resume.personalDetails?.email && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
                                    <Mail size={14} className="text-black" /> {resume.personalDetails.email}
                                </span>
                            )}
                            {resume.personalDetails?.phone && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
                                    <Phone size={14} className="text-black" /> {resume.personalDetails.phone}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Key Stats & Skills */}
                    <div className="space-y-6">
                        {/* Visual Stats Grid */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800"><Sparkles className="text-black" size={18} /> Key Highlights</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center">
                                    <Briefcase className="text-black mb-2" size={20} />
                                    <span className="block text-xl font-bold text-gray-800">{totalExperience}</span>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Roles Info</span>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center">
                                    <MapPin className="text-black mb-2" size={20} />
                                    <span className="block text-sm font-bold text-gray-800 line-clamp-1">
                                        {resume.personalDetails?.location?.split(',')[0] || "Remote"}
                                    </span>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</span>
                                </div>

                                <div className="col-span-2 p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between px-6">
                                    <div className="text-left">
                                        <span className="block text-xl font-bold text-gray-800">{resume.skills?.length || 0}</span>
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Skills</span>
                                    </div>
                                    <Code className="text-black" size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Skills Cloud */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800"><Code className="text-black" size={18} /> Expertise</h3>
                            <div className="flex flex-wrap gap-2">
                                {resume.skills?.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-800 hover:text-white hover:border-black transition-all cursor-default shadow-sm">
                                        {skill}
                                    </span>
                                ))}
                                {(!resume.skills || resume.skills.length === 0) && <p className="text-gray-400 text-sm">No skills listed.</p>}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                            <h3 className="font-bold mb-4 flex items-center gap-2"><UserCheck className="text-black" size={20} /> Summary</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {resume.summary || "No professional summary provided."}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Timeline */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Experience */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                            <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Briefcase className="text-black" size={22} /> Experience</h3>
                            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-100">
                                {resume.experience?.map((exp, idx) => (
                                    <div key={idx} className="relative pl-12 group">
                                        <div className="absolute left-3 top-1.5 w-4 h-4 rounded-full border-4 border-white bg-black shadow-lg shadow-gray-200"></div>
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-900 transition-colors">{exp.role}</h4>
                                            <p className="text-gray-600 font-medium text-sm mb-2">{exp.company} • {exp.duration || "N/A"}</p>
                                            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                {exp.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {(!resume.experience || resume.experience.length === 0) && <p className="pl-12 text-gray-400 italic">No experience listed.</p>}
                            </div>
                        </div>

                        {/* Projects */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                            <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><PenTool className="text-black" size={22} /> Projects</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {resume.projects?.map((proj, idx) => (
                                    <div key={idx} className="group p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-black hover:shadow-lg transition-all cursor-pointer">
                                        <h4 className="font-bold text-gray-900 mb-1 transition-colors">{proj.title}</h4>
                                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{proj.description}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {proj.techStack?.slice(0, 3).map((t, i) => (
                                                <span key={i} className="text-[10px] uppercase font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {(!resume.projects || resume.projects.length === 0) && <p className="text-gray-400 italic">No projects listed.</p>}
                        </div>

                        {/* Education */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                            <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><GraduationCap className="text-black" size={22} /> Education</h3>
                            <div className="space-y-6">
                                {resume.education?.map((edu, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 text-black">
                                            <GraduationCap size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                                            <p className="text-sm text-gray-600 font-medium">{edu.institute}</p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                <span>{edu.year}</span>
                                                {edu.score && <span className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded-full font-bold">{edu.score}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!resume.education || resume.education.length === 0) && <p className="text-gray-400 italic">No education listed.</p>}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Call-to-Action Banner */}
                <div className="bg-black text-white rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-xl shadow-zinc-200">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-black to-black opacity-60"></div>
                    <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                        <h2 className="text-3xl font-extrabold tracking-tight">Create Your Own AI-Powered Professional Profile</h2>
                        <p className="text-zinc-400 text-sm md:text-base">
                            ResJo AI helps you craft an optimized resume, check ATS scores, and find matched job recommendations in minutes.
                        </p>
                        <div className="pt-4">
                            <button
                                onClick={() => navigate('/register')}
                                className="bg-white text-black hover:bg-zinc-100 font-bold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105"
                            >
                                Get Started Free
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PublicProfile;
