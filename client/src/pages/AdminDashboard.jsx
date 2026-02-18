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

    const handleEventAction = async (eventId, status) => {
        try {
            const response = await fetch(`http://localhost:5001/api/events/${eventId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Error updating event:', error);
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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">
                                🛡️ Admin Dashboard
                            </h1>
                            <p className="text-gray-600 mt-2 text-lg">Welcome back, <span className="font-semibold text-blue-600">{user?.full_name}</span></p>
                            <p className="text-sm text-gray-500 mt-1">📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="flex gap-3">
                            <Link to="/create-event" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md font-medium">
                                ✨ Create Event
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-blue-200 text-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-600 text-sm font-medium uppercase tracking-wide">📅 Total Events</p>
                                <p className="text-4xl font-bold mt-2">{stats.totalEvents}</p>
                                <p className="text-gray-500 text-xs mt-1">All time events</p>
                            </div>
                            <div className="bg-blue-100 p-4 rounded-lg">
                                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-orange-200 text-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-600 text-sm font-medium uppercase tracking-wide">⏳ Pending Events</p>
                                <p className="text-4xl font-bold mt-2">{stats.pendingEvents}</p>
                                <p className="text-gray-500 text-xs mt-1">Awaiting approval</p>
                            </div>
                            <div className="bg-orange-100 p-4 rounded-lg">
                                <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-green-200 text-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-600 text-sm font-medium uppercase tracking-wide">👥 Total Faculty</p>
                                <p className="text-4xl font-bold mt-2">{faculty.length}</p>
                                <p className="text-gray-500 text-xs mt-1">Active members</p>
                            </div>
                            <div className="bg-green-100 p-4 rounded-lg">
                                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="border-b bg-gray-50">
                        <div className="flex gap-0">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-4 px-8 font-medium transition-all duration-200 border-b-3 relative ${
                                    activeTab === 'overview'
                                        ? 'border-blue-600 text-blue-600 bg-white shadow-sm'
                                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                }`}
                            >
                                📋 Events Overview
                                {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                            </button>
                            <button
                                onClick={() => setActiveTab('faculty')}
                                className={`py-4 px-8 font-medium transition-all duration-200 border-b-3 relative ${
                                    activeTab === 'faculty'
                                        ? 'border-blue-600 text-blue-600 bg-white shadow-sm'
                                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                }`}
                            >
                                👥 Faculty Management
                                {activeTab === 'faculty' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-800">📋 All Events</h2>
                                    <div className="text-sm text-gray-500">
                                        Total: {events.length} events
                                    </div>
                                </div>
                                {events.length > 0 ? (
                                    events.map((event) => (
                                        <div key={event.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all duration-200 hover:bg-blue-50 hover:border-blue-200">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h3>
                                                    <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                                                    <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            📅 {new Date(event.date).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            🕐 {event.time}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            📍 {event.location}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className="text-gray-500">
                                                            Created by: <span className="font-medium text-blue-600">{event.creator?.full_name || 'Unknown'}</span>
                                                        </span>
                                                        <Link 
                                                            to={`/events/${event.id}`}
                                                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                                        >
                                                            🔍 View Details
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-3 ml-6">
                                                    <span className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm ${
                                                        event.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                        'bg-red-100 text-red-800 border border-red-200'
                                                    }`}>
                                                        {event.status === 'approved' ? '✓ Approved' :
                                                         event.status === 'pending' ? '⏳ Pending' : '✗ Rejected'}
                                                    </span>
                                                    {event.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEventAction(event.id, 'approved')}
                                                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium shadow-sm"
                                                            >
                                                                ✓ Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleEventAction(event.id, 'rejected')}
                                                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-medium shadow-sm"
                                                            >
                                                                ✗ Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📅</div>
                                        <p className="text-gray-600 text-lg">No events found</p>
                                        <p className="text-gray-500 text-sm mt-2">Events will appear here once they are created</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'faculty' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-800">👥 Faculty Members</h2>
                                    <div className="text-sm text-gray-500">
                                        Total: {faculty.length} members
                                    </div>
                                </div>
                                {faculty.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {faculty.map((member) => (
                                            <div key={member.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all duration-200 hover:bg-green-50 hover:border-green-200">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                                {member.full_name?.charAt(0) || 'U'}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-800">{member.full_name}</h3>
                                                                <p className="text-blue-600 text-sm font-medium">{member.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                                                            <span className="flex items-center gap-1">
                                                                📅 Joined: {new Date(member.created_at).toLocaleDateString()}
                                                            </span>
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                                                                ✓ Active
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveFaculty(member.id)}
                                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-medium shadow-sm"
                                                    >
                                                        🗑️ Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">👥</div>
                                        <p className="text-gray-600 text-lg">No faculty members found</p>
                                        <p className="text-gray-500 text-sm mt-2">Faculty members will appear here once they register</p>
                                    </div>
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
