import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-background text-text flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <Outlet />
            </main>
            <footer className="bg-surface py-6 text-center text-sm text-text/60">
                &copy; {new Date().getFullYear()} Academic Event Management System
            </footer>
        </div>
    );
};

export default MainLayout;
