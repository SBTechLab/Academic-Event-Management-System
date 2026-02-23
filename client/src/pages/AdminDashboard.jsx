import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithCache } from '../cacheUtils';

const AdminDashboard = () => {
    const { user, getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalEvents: 0,
        pendingEvents: 0,
        totalUsers: 0,
        pendingCoordinators: 0
    });
    const [activeTab, setActiveTab] = useState('overview');
    const [events, setEvents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(10);

    const isEventCompleted = (eventDate, eventTime) => {
        const now = new Date();
        const eventDateTime = new Date(`${eventDate}T${eventTime}`);
        return eventDateTime < now;
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [eventsData, facultyData] = await Promise.all([
                fetchWithCache('http://localhost:5001/api/events?limit=50'),
                fetch('http://localhost:5001/api/users/faculty', { headers: getAuthHeaders() }).then(r => r.json())
            ]);

            const sortedEvents = eventsData.sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return new Date(b.created_at) - new Date(a.created_at);
            });
            setEvents(sortedEvents);
            setFaculty(facultyData);
            
            const regsPromises = eventsData.map(e => 
                fetch(`http://localhost:5001/api/registrations/event/${e.id}`, { headers: getAuthHeaders() })
                    .then(r => r.ok ? r.json() : [])
                    .catch(() => [])
            );
            const allRegs = (await Promise.all(regsPromises)).flat();
            const pendingCoords = allRegs.filter(r => r.role_type === 'coordinator' && r.status === 'pending').length;
            
            setStats({
                totalEvents: eventsData.length,
                pendingEvents: eventsData.filter(e => e.status === 'pending').length,
                totalUsers: 50,
                pendingCoordinators: pendingCoords
            });
            setLoading(false);
        } catch (error) {
            console.error(error);
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
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    <div className="bg-white border border-orange-300 p-6 rounded-2xl shadow-sm">
                        <p className="text-sm text-orange-600 font-semibold">⚠️ Pending Coordinators</p>
                        <p className="text-4xl font-bold text-orange-600 mt-2">{stats.pendingCoordinators}</p>
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
                            <>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-800">All Events</h3>
                                <div className="text-sm text-gray-600">
                                    Showing {Math.min(displayCount, events.length)} of {events.length} events
                                </div>
                            </div>
                            <div className="space-y-6">
                                {events.length > 0 ? (
                                    <>
                                    {events.slice(0, displayCount).map((event) => {
                                        const isCompleted = isEventCompleted(event.date, event.time);
                                        return (
                                        <div key={event.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                            <div className="flex justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                                        {event.status === 'approved' && (
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                isCompleted ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'
                                                            }`}>
                                                                {isCompleted ? '✓ Completed' : '📅 Upcoming'}
                                                            </span>
                                                        )}
                                                    </div>
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
                                    );})}
                                    {events.length > displayCount && (
                                        <div className="flex justify-center pt-6">
                                            <button
                                                onClick={() => setDisplayCount(prev => prev + 10)}
                                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-md"
                                            >
                                                Load More Events ({events.length - displayCount} remaining)
                                            </button>
                                        </div>
                                    )}
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No events found</p>
                                )}
                            </div>
                            </>
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
