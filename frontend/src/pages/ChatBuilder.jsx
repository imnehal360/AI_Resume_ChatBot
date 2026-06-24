import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useResume } from '../context/ResumeContext';
import { Send, Bot, User as UserIcon, Loader2, FileText, Briefcase, Paperclip } from 'lucide-react';

const ChatBuilder = () => {
    const { resume, setResume, updateResumeFromChat, loading } = useResume();
    const navigate = useNavigate();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/resume/chat/history');
                const history = res.data.messages;

                if (history.length > 0) {
                    setMessages(history);
                } else {
                    setMessages([{ role: 'ai', text: "Hello! I'm your AI Resume Assistant. Tell me about your education, skills, or experience, and I'll build your resume for you." }]);
                }
            } catch (err) {
                console.error("Failed to fetch chat history", err);
                // Fallback initial message
                setMessages([{ role: 'ai', text: "Hello! I'm your AI Resume Assistant. Tell me about your education, skills, or experience, and I'll build your resume for you." }]);
            }
        };

        fetchHistory();
    }, []);

    useEffect(() => {
        // Small timeout ensures DOM is updated before scrolling
        const timeoutId = setTimeout(() => {
            scrollToBottom();
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);

        // Optimistically show processing
        setMessages(prev => [...prev, { role: 'ai', text: "Processing...", loading: true }]);

        const result = await updateResumeFromChat(userMessage);

        setMessages(prev => prev.filter(msg => !msg.loading));

        if (result.success) {
            const aiResponse = result.chatResponse;
            setMessages(prev => [...prev, {
                role: 'ai',
                text: aiResponse?.text || "Resume updated."
            }]);
        } else {
            setMessages(prev => [...prev, {
                role: 'ai',
                text: result.error || "Sorry, I had trouble processing that. Please try again.",
                error: true
            }]);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file || file.type !== 'application/pdf') {
            setMessages(prev => [...prev, {
                role: 'ai',
                text: '⚠️ Please upload a PDF file only.',
                error: true
            }]);
            return;
        }

        setMessages(prev => [...prev, { role: 'user', text: `📎 Uploading ${file.name}...` }]);
        setMessages(prev => [...prev, { role: 'ai', text: 'Analyzing your resume PDF...', loading: true }]);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('resume', file);

            const res = await api.post('/resume/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.resume) setResume(res.data.resume);

            setMessages(prev => prev.filter(msg => !msg.loading));
            setMessages(prev => [...prev, {
                role: 'ai',
                text: res.data.chatResponse?.text || "✅ Resume parsed! Your skills and experience have been extracted. What would you like to refine?"
            }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => prev.filter(msg => !msg.loading));
            setMessages(prev => [...prev, {
                role: 'ai',
                text: '❌ Failed to upload or parse resume. Make sure it is a valid PDF.',
                error: true
            }]);
        } finally {
            setUploading(false);
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        e.target.value = null;
        if (file) handleFileUpload(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
            {/* Chat Column */}
            <div className="flex flex-col bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-gray-50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Bot size={20} />
                        <h2 className="font-semibold">AI Assistant</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
                                }`}>
                                {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`p-3 rounded-lg max-w-[80%] text-sm ${msg.role === 'user'
                                ? 'bg-black text-white rounded-tr-none'
                                : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                }`}>
                                {msg.loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={14} /> Processing...
                                    </span>
                                ) : (
                                    <>
                                        {msg.text}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* PDF Upload Zone */}
                <div
                    className={`mx-4 mt-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                        isDragging
                            ? 'border-black bg-gray-100 scale-[1.01]'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        accept=".pdf"
                        className="hidden"
                    />
                    <div className="flex items-center justify-center gap-3 py-3 px-4">
                        {uploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin text-gray-500" />
                                <span className="text-sm text-gray-600 font-medium">Parsing your resume...</span>
                            </>
                        ) : (
                            <>
                                <Paperclip size={18} className="text-gray-400" />
                                <span className="text-sm text-gray-500">
                                    <span className="font-semibold text-gray-700">Upload PDF Resume</span>
                                    {' '}&mdash; drag & drop or click to browse
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-border bg-white mt-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            placeholder="e.g. I worked at Google as a Senior Dev..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading || uploading}
                        />
                        <button
                            type="submit"
                            disabled={loading || uploading || !input.trim()}
                            className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    {/* Job Matches Button */}
                    <div className="mt-4 flex justify-center">
                        <button
                            type="button"
                            onClick={() => navigate('/recommendations')}
                            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Briefcase size={18} />
                            Check Job Matches
                        </button>
                    </div>
                </form>
            </div>

            {/* Live Preview Column (Simple Text Version for now) */}
            <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText size={20} />
                        <h2 className="font-semibold">Live Preview</h2>
                    </div>
                    {resume && <span className="text-xs text-green-600 font-medium flex items-center gap-1">● Synced</span>}
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-white">
                    {resume ? (
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="border-b pb-4">
                                <h1 className="text-2xl font-bold uppercase">{resume.personalDetails?.name || "YOUR NAME"}</h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    {resume.personalDetails?.email || "email@example.com"}
                                    {resume.personalDetails?.phone && ` | ${resume.personalDetails.phone}`}
                                </p>
                            </div>

                            {/* Summary */}
                            {resume.summary && (
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-gray-400 mb-2">Professional Summary</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">{resume.summary}</p>
                                </div>
                            )}

                            {/* Experience */}
                            {resume.experience?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-gray-400 mb-3">Experience</h3>
                                    <div className="space-y-4">
                                        {resume.experience.map((exp, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h4 className="font-bold text-gray-800">{exp.role}</h4>
                                                    <span className="text-xs text-gray-500">{exp.duration}</span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-700 mb-1">{exp.company}</p>
                                                <p className="text-sm text-gray-600">{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skills */}
                            {resume.skills?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-gray-400 mb-2">Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {resume.skills.map((skill, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Projects */}
                            {resume.projects?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-gray-400 mb-3 mt-4">Projects</h3>
                                    <div className="space-y-4">
                                        {resume.projects.map((proj, i) => (
                                            <div key={i}>
                                                <h4 className="font-bold text-gray-800">{proj.title}</h4>
                                                <p className="text-sm text-gray-600">{proj.description}</p>
                                                {proj.techStack && (
                                                    <p className="text-xs text-gray-500 mt-1">Stack: {proj.techStack.join(', ')}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Dump JSON for debugging if needed */}
                            {/* <pre className="text-xs mt-10 bg-gray-100 p-2 overflow-auto">{JSON.stringify(resume, null, 2)}</pre> */}

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <FileText size={48} className="mb-4 opacity-50" />
                            <p>Your resume preview will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatBuilder;
