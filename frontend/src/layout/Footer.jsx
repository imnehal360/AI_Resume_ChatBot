import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-border bg-surface mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="text-xl font-bold tracking-tight mb-4 block">
                            ResJo AI
                        </Link>
                        <p className="text-muted text-sm">
                            Building careers with the power of Artificial Intelligence.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-muted">
                            <li><Link to="/chat" className="hover:text-foreground transition-colors">Resume Builder</Link></li>
                            <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Job Matcher</Link></li>
                            <li><Link to="/dashboard" className="hover:text-foreground transition-colors">ATS Scanner</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-muted">
                            <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                            <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Connect</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="text-muted hover:text-foreground transition-colors">
                                <Github size={20} />
                            </a>
                            <a href="#" className="text-muted hover:text-foreground transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-muted hover:text-foreground transition-colors">
                                <Linkedin size={20} />
                            </a>
                            <a href="#" className="text-muted hover:text-foreground transition-colors">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted flex flex-col gap-2">
                    <p>&copy; {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
                    <p>Made with ❤️ for job seekers everywhere.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
