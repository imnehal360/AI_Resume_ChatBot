import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithToken, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Login Page: User state changed:", user);
        if (user) {
            console.log("Login Page: Redirecting to dashboard...");
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await axios.post("http://localhost:5050/api/auth/oauth-login", {
                token: credentialResponse.credential,
            });

            loginWithToken(res.data.token);

            // Navigate is now handled by useEffect
            console.log("Login Success", res.data);
        } catch (error) {
            console.error("Google Login Error", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
            {/* Main Floating Card Container */}
            <div className="flex w-full max-w-5xl h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden">

                {/* Left Side - Black Background with Quote & Google Login */}
                <div className="hidden lg:flex lg:w-1/2 bg-black text-white flex-col justify-center items-center p-12 relative">
                    <div className="relative z-10 max-w-md text-center space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold tracking-tighter">AI Resume Chatbot</h1>
                            <blockquote className="text-xl font-light italic opacity-80 leading-relaxed">
                                "Resume optimization is not about cheating the system, but clarifying your value."
                            </blockquote>
                        </div>

                        <div className="pt-8">
                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => {
                                        console.log('Login Failed');
                                    }}
                                    theme="filled_black"
                                    shape="pill"
                                />
                            </div>
                            <p className="mt-4 text-sm text-gray-400">Sign in with Google to get started instantly</p>
                        </div>
                    </div>

                    {/* Decorative background circles */}
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gray-800 rounded-full blur-3xl opacity-20"></div>
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-gray-800 rounded-full blur-3xl opacity-20"></div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">

                    <div className="w-full max-w-sm space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">Welcome Back</h2>
                            <p className="text-muted mt-2 text-sm">Enter your details to access your account</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1.5 ml-1 uppercase text-gray-500 tracking-wider">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-2.5 text-muted group-focus-within:text-black transition-colors" size={18} />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-1.5 ml-1 uppercase text-gray-500 tracking-wider">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-2.5 text-muted group-focus-within:text-black transition-colors" size={18} />
                                        <input
                                            type="password"
                                            required
                                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-2.5 rounded-lg font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center shadow-md hover:shadow-lg mt-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
                            </button>
                        </form>

                        <div className="text-center">
                            <p className="text-sm text-muted">
                                Don't have an account?{' '}
                                <Link to="/register" className="font-semibold text-black hover:underline">
                                    Create one
                                </Link>
                            </p>

                            {/* Mobile-only Google Login fallback */}
                            <div className="lg:hidden mt-6 pt-6 border-t border-gray-100">
                                <div className="flex justify-center">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => {
                                            console.log('Login Failed');
                                        }}
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

export default Login;
