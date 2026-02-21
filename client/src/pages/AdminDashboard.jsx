import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalEvents: 0,
        pendingEvents: 0,
        totalUsers: 0
    });
    const [activeTab, setActiveTab] = useState('overview');
    const [events, setEvents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [eventsRes, facultyRes] = await Promise.all([
                fetch('http://localhost:5001/api/events', { headers: getAuthHeaders() }),
                fetch('http://localhost:5001/api/users/faculty', { headers: getAuthHeaders() })
            ]);

            if (eventsRes.ok) {
                const eventsData = await eventsRes.json();
                setEvents(eventsData);
                setStats({
                    totalEvents: eventsData.length,
                    pendingEvents: eventsData.filter(e => e.status === 'pending').length,
                    totalUsers: 50
                });
            }

            if (facultyRes.ok) {
                const facultyData = await facultyRes.json();
                setFaculty(facultyData);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFaculty = async (facultyId) => {
        if (!confirm('Are you sure you want to remove this faculty member?')) return;

        try {
            const response = await fetch(`http://localhost:5001/api/users/faculty/${facultyId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Error removing faculty:', error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-500 mt-2">
                                Welcome back, <span className="font-semibold text-blue-600">{user?.full_name}</span>
                            </p>
                        </div>
                        <Link to="/create-event" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-semibold">
                            Create Event
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                        <p className="text-sm text-gray-500">Total Events</p>
                        <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalEvents}</p>
                    </div>
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                        <p className="text-sm text-gray-500">Pending Events</p>
                        <p className="text-4xl font-bold text-yellow-600 mt-2">{stats.pendingEvents}</p>
                    </div>
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                        <p className="text-sm text-gray-500">Total Faculty</p>
                        <p className="text-4xl font-bold text-gray-900 mt-2">{faculty.length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex-1 py-4 font-medium transition ${
                                activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
                            }`}>
                            Events
                        </button>
                        <button
                            onClick={() => setActiveTab('faculty')}
                            className={`flex-1 py-4 font-medium transition ${
                                activeTab === 'faculty' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
                            }`}>
                            Faculty
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {events.length > 0 ? (
                                    events.map((event) => (
                                        <div key={event.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                            <div className="flex justify-between">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                                    <p className="text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                                                    <div className="flex gap-6 text-sm text-gray-500 mt-4">
                                                        <span>📅 {event.date}</span>
                                                        <span>🕐 {event.time}</span>
                                                        <span>📍 {event.location}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        Created by: {event.creator?.full_name || 'Unknown'}
                                                    </p>
                                                    {event.rejection_reason && (
                                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                            <p className="text-xs font-semibold text-red-800 mb-1">❌ Rejection Reason:</p>
                                                            <p className="text-sm text-red-900">{event.rejection_reason}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        event.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {event.status}
                                                    </span>
                                                    <Link
                                                        to={`/events/${event.id}`}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No events found</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'faculty' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {faculty.length > 0 ? (
                                    faculty.map((member) => (
                                        <div key={member.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{member.full_name}</h3>
                                                    <p className="text-sm text-gray-500">{member.email}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Joined: {new Date(member.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveFaculty(member.id)}
                                                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center col-span-2 py-8">No faculty members found</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
