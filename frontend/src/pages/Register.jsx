import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Loader2, Briefcase } from 'lucide-react';
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, loginWithToken } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await register(name, email, password, role);
        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await axios.post("http://localhost:5050/api/auth/oauth-login", {
                token: credentialResponse.credential,
            });

            loginWithToken(res.data.token);
            navigate('/dashboard');
        } catch (error) {
            console.error("Google Signup Error", error);
            setError("Google Signup Failed. Please try email signup.");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
            {/* Main Floating Card Container - Matching Login Height */}
            <div className="flex w-full max-w-5xl h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden">

                {/* Left Side */}
                <div className="hidden lg:flex lg:w-1/2 bg-black text-white flex-col justify-center items-center p-8 relative">
                    <div className="relative z-10 max-w-md text-center space-y-6">
                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold tracking-tighter">Join AI Resume Chatbot</h1>
                            <blockquote className="text-lg font-light italic opacity-80 leading-relaxed">
                                "The best way to predict the future is to create it."
                            </blockquote>
                        </div>

                        <div className="pt-6">
                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => {
                                        console.log('Login Failed');
                                    }}
                                    theme="filled_black"
                                    shape="pill"
                                    text="signup_with"
                                />
                            </div>
                            <p className="mt-4 text-xs text-gray-400">Join with Google to get started instantly</p>
                        </div>
                    </div>

                    {/* Decorative background circles */}
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gray-800 rounded-full blur-3xl opacity-20"></div>
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-gray-800 rounded-full blur-3xl opacity-20"></div>
                </div>

                {/* Right Side - Register Form with Compact Spacing */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white relative">

                    <div className="w-full max-w-sm space-y-4">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">Create Account</h2>
                            <p className="text-muted mt-1 text-xs">Start building your resume today</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 p-2 rounded-lg text-xs font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-medium mb-1 ml-1 uppercase text-gray-500 tracking-wider">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-2.5 text-muted group-focus-within:text-black transition-colors" size={16} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-medium mb-1 ml-1 uppercase text-gray-500 tracking-wider">Role</label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-3 top-2.5 text-muted group-focus-within:text-black transition-colors" size={16} />
                                        <select
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all appearance-none cursor-pointer"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                        >
                                            <option value="student">Student</option>
                                            <option value="fresher">Fresher</option>
                                            <option value="professional">Professional</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-medium mb-1 ml-1 uppercase text-gray-500 tracking-wider">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-2.5 text-muted group-focus-within:text-black transition-colors" size={16} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-medium mb-1 ml-1 uppercase text-gray-500 tracking-wider">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-2.5 text-muted group-focus-within:text-black transition-colors" size={16} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center shadow-md hover:shadow-lg mt-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
                            </button>
                        </form>

                        <div className="text-center">
                            <p className="text-xs text-muted">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-black hover:underline">
                                    Sign in
                                </Link>
                            </p>

                            {/* Mobile-only Google Login fallback */}
                            <div className="lg:hidden mt-4 pt-4 border-t border-gray-100">
                                <div className="flex justify-center">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => {
                                            console.log('Login Failed');
                                        }}
                                        text="signup_with"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
