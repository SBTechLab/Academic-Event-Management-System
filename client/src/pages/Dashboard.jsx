import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, role, getAuthHeaders } = useAuth();
    const [stats, setStats] = useState({
        myEvents: 0,
        pendingApprovals: 0,
    });
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Notifications from Backend API
                const headers = getAuthHeaders();
                const response = await fetch('http://localhost:5000/api/notifications', {
                    headers: headers
                });

                if (response.ok) {
                    const notifs = await response.json();
                    setNotifications(notifs || []);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) return <div className="text-center py-10">Loading dashboard...</div>;

    const isFacultyOrAdmin = role === 'admin' || role === 'faculty';

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-primary">
                        Welcome, {user?.user_metadata?.full_name || 'User'}
                    </h1>
                    <p className="text-text/60 mt-1 capitalize">Role: {role || 'Student'}</p>
                </div>

                <div className="flex gap-4">
                    <Link to="/events" className="bg-secondary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors">
                        Browse Events
                    </Link>
                    {isFacultyOrAdmin && (
                        <Link to="/events/create" className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors">
                            Create Event
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-text mb-2">My Profile</h3>
                    <p className="text-sm text-text/60 mb-4">{user?.email}</p>
                    <button className="text-primary text-sm font-medium hover:underline">Edit Profile</button>
                </div>

                <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-text mb-2">Notifications</h3>
                    {notifications.length > 0 ? (
                        <ul className="space-y-2 mt-2">
                            {notifications.map(n => (
                                <li key={n.id} className="text-sm border-b border-gray-50 pb-2 last:border-0">
                                    {n.message}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-text/60 mt-2">No new notifications.</p>
                    )}
                </div>

                <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-text mb-2">Quick Actions</h3>
                    <div className="flex flex-col space-y-2 mt-2">
                        <Link to="/events" className="text-primary text-sm hover:underline">View All Events</Link>
                        {isFacultyOrAdmin && (
                            <Link to="/events/create" className="text-primary text-sm hover:underline">Create New Event</Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-primary mb-4">Your Recent Activity</h2>
                <p className="text-text/60">Activity feed coming soon...</p>
            </div>
        </div>
    );
};

export default Dashboard;
