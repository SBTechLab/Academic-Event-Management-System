import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, role, getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        myEvents: 0,
        pendingApprovals: 0,
    });
    const [notifications, setNotifications] = useState([]);
    const [coordinatorApps, setCoordinatorApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const headers = getAuthHeaders();
                
                // Fetch Notifications
                const response = await fetch('http://localhost:5001/api/notifications', {
                    headers: headers
                });

                if (response.ok) {
                    const notifs = await response.json();
                    setNotifications(notifs || []);
                }

                // Fetch coordinator applications if admin/faculty
                if (role === 'admin' || role === 'faculty') {
                    const appsResponse = await fetch('http://localhost:5001/api/coordinator/applications', {
                        headers: headers
                    });
                    if (appsResponse.ok) {
                        const apps = await appsResponse.json();
                        setCoordinatorApps(apps.data || []);
                    }
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, role]);

    if (loading) return <div className="text-center py-10">Loading dashboard...</div>;

    const isFacultyOrAdmin = role === 'admin' || role === 'faculty';

    return (
        <div>
            <button
                onClick={() => navigate(-1)}
                className="mb-4 text-primary hover:underline flex items-center gap-2"
            >
                ← Back
            </button>
            
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
                    <Link to="/profile" className="text-primary text-sm font-medium hover:underline">Edit Profile</Link>
                </div>

                <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-text mb-2">Notifications</h3>
                    {notifications.length > 0 ? (
                        <ul className="space-y-2 mt-2">
                            {notifications.slice(0, 3).map(n => (
                                <li key={n.id} className="text-sm border-b border-gray-50 pb-2 last:border-0">
                                    {n.message}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-text/60 mt-2">No new notifications.</p>
                    )}
                    
                    {(role === 'admin' || role === 'faculty') && coordinatorApps.filter(a => a.status === 'pending').length > 0 && (
                        <Link to="/coordinator-applications" className="text-primary text-sm hover:underline block mt-3">
                            {coordinatorApps.filter(a => a.status === 'pending').length} Pending Coordinator Requests
                        </Link>
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
