import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { clearCache } from '../cacheUtils';

const AdminDashboard = () => {
    const { user, getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalEvents: 0, pendingEvents: 0, pendingCoordinators: 0 });
    const [activeTab, setActiveTab] = useState('overview');
    const [events, setEvents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 8;

    const isEventCompleted = (eventDate, eventTime) => new Date(`${eventDate}T${eventTime}`) < new Date();

    useEffect(() => { clearCache(); fetchDashboardData(); }, []);

    useEffect(() => {
        const fn = () => { if (document.visibilityState === 'visible') { clearCache(); fetchDashboardData(); } };
        document.addEventListener('visibilitychange', fn);
        return () => document.removeEventListener('visibilitychange', fn);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => { clearCache(); fetchDashboardData(); }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => { setPage(1); }, [activeTab]);

    const fetchDashboardData = async () => {
        try {
            clearCache();
            const [eventsData, facultyData] = await Promise.all([
                fetch(`http://localhost:5001/api/events?limit=50&_=${Date.now()}`).then(r => r.json()),
                fetch('http://localhost:5001/api/users/faculty', { headers: getAuthHeaders() }).then(r => r.json())
            ]);
            const sortedEvents = eventsData.sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return new Date(b.created_at) - new Date(a.created_at);
            });
            setEvents(sortedEvents);
            setFaculty(facultyData);
            setStats({
                totalEvents: eventsData.length,
                pendingEvents: eventsData.filter(e => e.status === 'pending').length,
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
                method: 'DELETE', headers: getAuthHeaders()
            });
            if (response.ok) fetchDashboardData();
        } catch (error) {
            console.error('Error removing faculty:', error);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="dashboard-shell">
            <div className="dashboard-card p-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="dashboard-title text-3xl">Admin Dashboard</h1>
                        <p className="dashboard-subtitle mt-2">
                            Welcome back, <span className="font-semibold text-blue-600">{user?.full_name}</span>
                        </p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        className="border border-blue-300 text-blue-600 px-4 py-2.5 rounded-xl hover:bg-blue-50 transition font-semibold text-sm"
                        title="Refresh dashboard">
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(0,97,255,0.88), rgba(0,63,163,0.80))', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,97,255,0.28)' }}>
                    <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Total Events</p>
                    <p className="text-4xl font-extrabold text-white mt-1">{stats.totalEvents}</p>
                </div>
                <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.88), rgba(180,83,9,0.80))', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(245,158,11,0.28)' }}>
                    <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Pending Events</p>
                    <p className="text-4xl font-extrabold text-white mt-1">{stats.pendingEvents}</p>
                </div>
                <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.88), rgba(4,120,87,0.80))', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(5,150,105,0.28)' }}>
                    <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Total Faculty</p>
                    <p className="text-4xl font-extrabold text-white mt-1">{faculty.length}</p>
                </div>
            </div>

            <div className="dashboard-card overflow-hidden">
                <div className="flex border-b">
                    <button onClick={() => setActiveTab('overview')}
                        className={`flex-1 py-4 font-medium transition ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}>
                        Events
                    </button>
                    <button onClick={() => setActiveTab('faculty')}
                        className={`flex-1 py-4 font-medium transition ${activeTab === 'faculty' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}>
                        Faculty
                    </button>
                </div>

                <div className="p-8">
                    {activeTab === 'overview' && (
                        <>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">All Events</h3>
                            <span className="text-sm text-gray-500">
                                {events.length} events · Page {page} of {Math.ceil(events.length / PAGE_SIZE) || 1}
                            </span>
                        </div>
                        <div className="space-y-6">
                            {events.length > 0 ? (
                                <>
                                {events.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((event) => {
                                    const isCompleted = isEventCompleted(event.date, event.time);
                                    return (
                                    <div key={event.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                        <div className="flex justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                                    {event.status === 'approved' && (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isCompleted ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                                                            {isCompleted ? 'Completed' : 'Upcoming'}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                                                <div className="flex gap-6 text-sm text-gray-500 mt-4">
                                                    <span>Date: {event.date}</span>
                                                    <span>Time: {event.time}</span>
                                                    <span>Location: {event.location}</span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2">Created by: {event.creator?.full_name || 'Unknown'}</p>
                                                {event.rejection_reason && (
                                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                        <p className="text-xs font-semibold text-red-800 mb-1">Rejection Reason:</p>
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
                                                <Link to={`/events/${event.id}`}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );})}
                                {Math.ceil(events.length / PAGE_SIZE) > 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-4">
                                        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                                            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                            Prev
                                        </button>
                                        {Array.from({ length: Math.ceil(events.length / PAGE_SIZE) }, (_, i) => i + 1).map(p => (
                                            <button key={p} onClick={() => setPage(p)}
                                                style={p === page ? { background: '#0061ff' } : {}}
                                                className={`w-9 h-9 rounded-lg text-sm font-medium transition ${p === page ? 'text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                                                {p}
                                            </button>
                                        ))}
                                        <button onClick={() => setPage(p => p + 1)} disabled={page === Math.ceil(events.length / PAGE_SIZE)}
                                            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                            Next
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
                                                <p className="text-xs text-gray-400 mt-1">Joined: {new Date(member.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <button onClick={() => handleRemoveFaculty(member.id)}
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
    );
};

export default AdminDashboard;
