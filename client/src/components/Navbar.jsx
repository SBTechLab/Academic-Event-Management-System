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
        <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    🎓 UniEvents
                </Link>
                <div className="flex space-x-6 items-center">
                    <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                        Home
                    </Link>
                    <Link to="/events" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                        Events
                    </Link>
                    <div className="flex space-x-4 ml-4 items-center">
                        {user ? (
                            <>
                                <Link 
                                    to={getDashboardLink()} 
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    📊 Dashboard
                                </Link>
                                <div className="text-gray-700 text-sm">
                                    👋 {user.full_name} ({role})
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-700 hover:text-red-600 transition-colors font-medium"
                                >
                                    🚪 Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                                    Login
                                </Link>
                                <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="ml-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
                        title="Toggle Theme"
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
