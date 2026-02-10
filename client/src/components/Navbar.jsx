import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { user, logout } = useAuth();
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

    return (
        <nav className="bg-surface shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold text-primary">
                    UniEvents
                </Link>
                <div className="flex space-x-6 items-center">
                    <Link to="/" className="hover:text-primary transition-colors">
                        Home
                    </Link>
                    <Link to="/events" className="hover:text-primary transition-colors">
                        Events
                    </Link>
                    <div className="flex space-x-4 ml-4 items-center">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-primary font-medium hover:underline">
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-text/80 hover:text-red-500 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-primary font-medium hover:underline">
                                    Login
                                </Link>
                                <Link to="/signup" className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="ml-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
