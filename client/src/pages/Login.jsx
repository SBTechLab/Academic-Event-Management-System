import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const goOnline  = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);
        window.addEventListener('online',  goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online',  goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!navigator.onLine) {
            setError('No internet connection. Please check your network and try again.');
            setLoading(false);
            return;
        }

        try {
            const user = await login(email, password);
            switch (user.role) {
                case 'admin':   navigate('/admin-dashboard');   break;
                case 'faculty': navigate('/faculty-dashboard'); break;
                case 'student':
                default:        navigate('/student-dashboard'); break;
            }
        } catch (err) {
            if (!navigator.onLine) {
                setError('No internet connection. Please check your network and try again.');
            } else {
                setError('Invalid email or password.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Login to UniEvents</h2>
                    <p className="text-gray-500 mt-2 text-sm">Access your academic dashboard</p>
                </div>

                {!isOnline && (
                    <div className="mb-5 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg text-sm flex items-center gap-2">
                        <span>⚠️</span>
                        <span>You are offline. Please check your internet connection.</span>
                    </div>
                )}

                {error && (
                    <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="you@university.edu"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="Enter your password"
                        />
                        <div className="text-right mt-1">
                            <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline font-medium">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !isOnline}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-60 shadow-md"
                    >
                        {loading ? 'Signing in...' : !isOnline ? 'No Internet Connection' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-6 text-sm text-center text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-600 font-medium hover:underline">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
