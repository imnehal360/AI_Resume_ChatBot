import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    User, Mail, Phone, MapPin, Briefcase, GraduationCap,
    Code, Award, UserCheck, Star, PenTool, MessageSquare, Sparkles,
    Globe, Copy, Check
} from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isPublic, setIsPublic] = useState(false);
    const [shareId, setShareId] = useState("");
    const [sharingLoading, setSharingLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const res = await api.get('/resume');
                setResume(res.data.resume);
                setIsPublic(res.data.resume?.isPublic || false);
                setShareId(res.data.resume?.shareId || "");
            } catch (error) {
                console.error("Failed to fetch resume profile", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchResume();
    }, [user]);

    const toggleSharing = async () => {
        setSharingLoading(true);
        try {
            const nextStatus = !isPublic;
            const res = await api.post('/resume/share-settings', { isPublic: nextStatus });
            setIsPublic(res.data.isPublic);
            setShareId(res.data.shareId || "");
        } catch (error) {
            console.error("Failed to update sharing settings", error);
        } finally {
            setSharingLoading(false);
        }
    };

    const getShareUrl = () => {
        return `${window.location.origin}/public-profile/${shareId}`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(getShareUrl());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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

    if (!resume) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <User size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Profile Found</h2>
                <p className="text-gray-500 mb-6 max-w-md">Start chatting with the AI to build your professional profile and resume!</p>
                <button onClick={() => navigate('/chat')} className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors">
                    Go to Chat Builder
                </button>
            </div>
        );
    }

    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email}`;

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
                            {resume.personalDetails?.name || user.name || "User"}
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

                    <div className="relative z-10 flex flex-col gap-3 min-w-[160px]">
                        <button
                            onClick={() => navigate('/chat')}
                            className="bg-black text-white px-5 py-3 rounded-2xl text-sm font-medium hover:bg-gray-800 hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
                        >
                            <MessageSquare size={18} /> Update with AI
                        </button>

                        <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl text-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">ATS Score</p>
                            <p className="text-2xl font-black text-black">{resume.atsScore || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Sharing Settings Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                                <Globe size={20} className="text-black" /> Public Profile Sharing
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Enable this to let anyone view your professional profile without logging in.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700">
                                {isPublic ? "Public" : "Private"}
                            </span>
                            <button
                                onClick={toggleSharing}
                                disabled={sharingLoading}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    isPublic ? "bg-black" : "bg-gray-200"
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        isPublic ? "translate-x-5" : "translate-x-0"
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {isPublic && shareId && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-in fade-in duration-300">
                            <input
                                type="text"
                                readOnly
                                value={getShareUrl()}
                                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="bg-black hover:bg-gray-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? "Copied!" : "Copy Link"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Professional Summary - Full Width */}
                    <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900"><UserCheck className="text-black" size={20} /> Professional Summary</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {resume.summary || "Your professional summary will appear here once you describe yourself in the chat."}
                        </p>
                    </div>

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

                        {/* Skills Cloud - Enhanced */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800"><Code className="text-black" size={18} /> Expertise</h3>
                            <div className="flex flex-wrap gap-2">
                                {resume.skills?.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-800 hover:text-white hover:border-black transition-all cursor-default shadow-sm">
                                        {skill}
                                    </span>
                                ))}
                                {(!resume.skills || resume.skills.length === 0) && <p className="text-gray-400 text-sm">No skills added yet.</p>}
                            </div>
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
                                {(!resume.experience || resume.experience.length === 0) && <p className="pl-12 text-gray-400 italic">No experience added.</p>}
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
                            {(!resume.projects || resume.projects.length === 0) && <p className="text-gray-400 italic">No projects added.</p>}
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
                                {(!resume.education || resume.education.length === 0) && <p className="text-gray-400 italic">No education added.</p>}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
