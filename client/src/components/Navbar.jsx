import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout, role } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to logout', error);
        }
    };

    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (role) {
            case 'admin': return '/admin-dashboard';
            case 'faculty': return '/faculty-dashboard';
            default: return '/student-dashboard';
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex justify-between items-center">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-sm" style={{ background: '#0061ff' }}>U</div>
                        <span className="text-xl font-extrabold text-blue-600 tracking-tight">UniEvents</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About Us</Link>
                        <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
                        {user && (
                            <Link to="/events" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Events</Link>
                        )}

                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <Link to={getDashboardLink()}
                                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200">
                                        Dashboard
                                    </Link>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                                        <span className="font-medium">{user.full_name}</span>
                                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full capitalize">{role}</span>
                                    </div>
                                    <button onClick={handleLogout} className="text-gray-600 hover:text-red-600 font-medium transition-colors">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Login</Link>
                                    <Link to="/signup"
                                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                            <span className="sr-only">Open main menu</span>
                            {!isMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                            <Link to="/about" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>About Us</Link>
                            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>Home</Link>
                            {user && (
                                <Link to="/events" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>Events</Link>
                            )}

                            <div className="border-t border-gray-200 pt-4 mt-4">
                                {user ? (
                                    <div className="space-y-3">
                                        <div className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg">
                                            <div className="font-medium">{user.full_name}</div>
                                            <div className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full capitalize inline-block mt-1">{role}</div>
                                        </div>
                                        <Link to={getDashboardLink()}
                                            className="block w-full px-3 py-2 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-all duration-200"
                                            onClick={() => setIsMenuOpen(false)}>
                                            Dashboard
                                        </Link>
                                        <button onClick={handleLogout} className="block w-full px-3 py-2 text-left text-gray-600 hover:text-red-600 font-medium transition-colors">
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Link to="/login" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>Login</Link>
                                        <Link to="/signup"
                                            className="block w-full px-3 py-2 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-all duration-200"
                                            onClick={() => setIsMenuOpen(false)}>
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
