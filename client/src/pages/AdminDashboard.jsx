import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, getAuthHeaders } = useAuth();
    const [stats, setStats] = useState({
        totalEvents: 0,
        pendingEvents: 0,
        totalUsers: 0
    });
    const [recentEvents, setRecentEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/events', {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const events = await response.json();
                setRecentEvents(events.slice(0, 5));
                setStats({
                    totalEvents: events.length,
                    pendingEvents: events.filter(e => e.status === 'pending').length,
                    totalUsers: 50 // placeholder
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
                <p className="text-text/70">Welcome, {user?.full_name}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-text/70">Total Events</h3>
                    <p className="text-2xl font-bold text-primary">{stats.totalEvents}</p>
                </div>
                <div className="bg-card p-6 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-text/70">Pending Events</h3>
                    <p className="text-2xl font-bold text-orange-600">{stats.pendingEvents}</p>
                </div>
                <div className="bg-card p-6 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-text/70">Total Users</h3>
                    <p className="text-2xl font-bold text-green-600">{stats.totalUsers}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-primary mb-4">Admin Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/create-event"
                        className="bg-primary text-white p-4 rounded-lg text-center hover:bg-opacity-90"
                    >
                        Create Event
                    </Link>
                    <Link
                        to="/events"
                        className="bg-secondary text-white p-4 rounded-lg text-center hover:bg-opacity-90"
                    >
                        Manage Events
                    </Link>
                    <Link
                        to="/coordinator-requests"
                        className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-opacity-90"
                    >
                        Coordinator Requests
                    </Link>
                </div>
            </div>

            {/* Recent Events */}
            <div className="bg-card p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-primary mb-4">Recent Events</h2>
                {recentEvents.length > 0 ? (
                    <div className="space-y-3">
                        {recentEvents.map((event) => (
                            <div key={event.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div>
                                    <h3 className="font-medium">{event.title}</h3>
                                    <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${
                                    event.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {event.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No events found</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;