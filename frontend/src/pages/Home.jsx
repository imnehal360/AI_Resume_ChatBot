import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle } from 'lucide-react';

const Home = () => {
    const { user } = useAuth();
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-sm font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                AI-Powered Resume Builder
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                Build your resume with <br />
                <span className="text-gray-500">Just a Conversation.</span>
            </h1>

            <p className="text-lg text-muted mb-10 max-w-2xl">
                Stop struggling with templates. Chat with our AI to build a professional resume,
                get ATS scores, and receive personalized job recommendations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/chat">
                    <button className="bg-foreground text-surface px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-800 transition-all flex items-center gap-2">
                        Start Building <ArrowRight size={20} />
                    </button>
                </Link>
                {!user && (
                    <Link to="/login">
                        <button className="bg-white border border-border px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-50 transition-all">
                            Login
                        </button>
                    </Link>
                )}
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {[
                    "Real-time ATS Scoring",
                    "Automated Job Matching",
                    "Smart Resume Formatting"
                ].map((feature, idx) => (
                    <div key={idx} className="p-6 bg-surface rounded-xl border border-border shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-zinc-900 hover:text-white group">
                        <CheckCircle className="mb-4 text-foreground group-hover:text-white transition-colors" />
                        <h3 className="font-semibold text-lg">{feature}</h3>
                        <p className="text-muted text-sm mt-2 group-hover:text-gray-300 transition-colors">
                            Advanced AI algorithms working for you.
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
