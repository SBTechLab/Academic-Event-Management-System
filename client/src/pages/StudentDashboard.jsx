import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { fetchWithCache } from '../cacheUtils';

const StudentDashboard = () => {
    const { user, getAuthHeaders } = useAuth();
    const [allEvents, setAllEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [selectedType, setSelectedType] = useState('all');
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(10);

    const isEventCompleted = (eventDate, eventTime) => {
        const now = new Date();
        const eventDateTime = new Date(`${eventDate}T${eventTime}`);
        return eventDateTime < now;
    };

    const eventTypes = [
        { value: 'all', label: 'All Events', icon: '🎯' },
        { value: 'technical', label: 'Technical', icon: '💻' },
        { value: 'cultural', label: 'Cultural', icon: '🎭' },
        { value: 'sports', label: 'Sports', icon: '⚽' },
        { value: 'workshop', label: 'Workshop', icon: '🛠️' },
        { value: 'seminar', label: 'Seminar', icon: '📚' },
        { value: 'competition', label: 'Competition', icon: '🏆' },
        { value: 'general', label: 'General', icon: '📌' }
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        filterEvents();
    }, [selectedType, allEvents]);

    const fetchDashboardData = async () => {
        try {
            const [eventsData, regData] = await Promise.all([
                fetchWithCache('http://localhost:5001/api/events?limit=50'),
                fetch('http://localhost:5001/api/registrations/my-registrations', { headers: getAuthHeaders() }).then(r => r.json())
            ]);
            setAllEvents(eventsData.filter(e => e.status === 'approved'));
            setRegistrations(regData);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const filterEvents = () => {
        if (selectedType === 'all') {
            setFilteredEvents(allEvents);
        } else {
            setFilteredEvents(allEvents.filter(e => e.event_type === selectedType));
        }
    };



    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h1 className="text-4xl font-bold text-gray-800">Student Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome, {user?.full_name}</p>
                    <Link to="/my-events" className="inline-block mt-3 text-blue-600 hover:text-blue-800 font-medium">
                        View My Events →
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-xl shadow-lg">
                        <p className="text-teal-100 text-sm font-medium">Available Events</p>
                        <p className="text-4xl font-bold mt-2">{allEvents.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                        <p className="text-green-100 text-sm font-medium">My Registrations</p>
                        <p className="text-4xl font-bold mt-2">{registrations.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                        <p className="text-blue-100 text-sm font-medium">Attended Events</p>
                        <p className="text-4xl font-bold mt-2">
                            {registrations.filter(r => r.status === 'attended').length}
                        </p>
                    </div>
                </div>

                {/* Event Type Filter */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Explore Events by Type</h2>
                    <div className="flex flex-wrap gap-3">
                        {eventTypes.map(type => (
                            <button
                                key={type.value}
                                onClick={() => setSelectedType(type.value)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    selectedType === type.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {type.icon} {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {selectedType === 'all' ? 'All Events' : `${eventTypes.find(t => t.value === selectedType)?.label} Events`}
                        </h2>
                        <div className="text-sm text-gray-600">
                            Showing {Math.min(displayCount, filteredEvents.length)} of {filteredEvents.length} events
                        </div>
                    </div>
                    {filteredEvents.length > 0 ? (
                        <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredEvents.slice(0, displayCount).map((event) => {
                                const isCompleted = isEventCompleted(event.date, event.time);
                                return (
                                <div key={event.id} className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md transition">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-lg text-gray-800">{event.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                isCompleted ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                                {isCompleted ? '✓ Completed' : '📅 Upcoming'}
                                            </span>
                                        </div>
                                        <span className="text-2xl">{eventTypes.find(t => t.value === event.event_type)?.icon || '📌'}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                                    <div className="flex flex-col gap-1 text-sm text-gray-500 mb-3">
                                        <span>📅 {event.date}</span>
                                        <span>🕐 {event.time}</span>
                                        <span>📍 {event.location}</span>
                                    </div>
                                    <Link
                                        to={`/events/${event.id}`}
                                        className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm transition font-medium"
                                    >
                                        View Details & Register
                                    </Link>
                                </div>
                            );})}
                        </div>
                        {filteredEvents.length > displayCount && (
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={() => setDisplayCount(prev => prev + 10)}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition font-semibold shadow-md"
                                >
                                    Load More Events ({filteredEvents.length - displayCount} remaining)
                                </button>
                            </div>
                        )}
                        </>
                    ) : (
                        <p className="text-gray-600 text-center py-8">No {selectedType !== 'all' ? selectedType : ''} events available at the moment</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
