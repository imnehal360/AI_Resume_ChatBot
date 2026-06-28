import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, LayoutDashboard, FileText, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="h-16 border-b border-border bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50 transition-all duration-300">
            <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-8 h-8 bg-foreground text-surface rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <MessageSquare size={18} />
                </div>
                <Link to="/" className="text-xl font-bold tracking-tight group-hover:opacity-80 transition-opacity">
                    ResJo AI
                </Link>
            </div>

            <div className="flex items-center gap-8">
                {user && (
                    <>
                        <Link to="/dashboard" className="text-sm font-medium hover:text-gray-600 transition-colors relative group">
                            Dashboard
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-zinc-900 transition-all group-hover:w-full"></span>
                        </Link>
                        <Link to="/chat" className="text-sm font-medium hover:text-gray-600 transition-colors relative group">
                            Chat Builder
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-zinc-900 transition-all group-hover:w-full"></span>
                        </Link>
                        <Link to="/profile" className="text-sm font-medium hover:text-gray-600 transition-colors relative group">
                            Profile
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-zinc-900 transition-all group-hover:w-full"></span>
                        </Link>
                    </>
                )}
                {user ? (
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                        Logout
                    </button>
                ) : (
                    <Link to="/login">
                        <button className="bg-foreground text-surface px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                            Sign In
                        </button>
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
