import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-6 py-8">
                <Suspense fallback={
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
                    </div>
                }>
                    <Outlet />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
