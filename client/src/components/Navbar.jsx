import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { user, logout, role } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

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
            case 'admin':
                return '/admin-dashboard';
            case 'faculty':
                return '/faculty-dashboard';
            case 'student':
                return '/student-dashboard';
            default:
                return '/student-dashboard';
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                {/* Logo */}
                <Link 
                    to="/" 
                    className="text-2xl font-extrabold text-blue-600 tracking-tight hover:text-blue-700 transition-colors"
                >
                    UniEvents
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center space-x-8">

                    <Link 
                        to="/" 
                        className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                        Home
                    </Link>

                    <Link 
                        to="/events" 
                        className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                        Events
                    </Link>

                    {/* Auth Section */}
                    <div className="flex items-center space-x-4">

                        {user ? (
                            <>
                                {/* Dashboard Button */}
                                <Link
                                    to={getDashboardLink()}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200"
                                >
                                    Dashboard
                                </Link>

                                {/* User Info */}
                                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                                    <span className="font-medium">{user.full_name}</span>
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full capitalize">
                                        {role}
                                    </span>
                                </div>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-600 hover:text-red-600 font-medium transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/signup"
                                    className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="ml-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            title="Toggle Theme"
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>

                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;