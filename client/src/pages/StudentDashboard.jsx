import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { fetchWithCache } from '../cacheUtils';

const PAGE_SIZE = 6;

const eventTypes = [
    { value: 'all',         label: 'All' },
    { value: 'technical',   label: 'Technical' },
    { value: 'cultural',    label: 'Cultural' },
    { value: 'sports',      label: 'Sports' },
    { value: 'workshop',    label: 'Workshop' },
    { value: 'seminar',     label: 'Seminar' },
    { value: 'competition', label: 'Competition' },
    { value: 'general',     label: 'General' },
];

const typeIcon = (t) => t.charAt(0).toUpperCase();

const StudentDashboard = () => {
    const { user, getAuthHeaders } = useAuth();
    const [allEvents, setAllEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('all');
    const [page, setPage] = useState(1);

    const isCompleted = (date, time) => new Date(`${date}T${time}`) < new Date();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventsData, regData] = await Promise.all([
                    fetchWithCache('http://localhost:5001/api/events?limit=50'),
                    fetch('http://localhost:5001/api/registrations/my-registrations', { headers: getAuthHeaders() }).then(r => r.json())
                ]);
                setAllEvents(eventsData.filter(e => e.status === 'approved'));
                setRegistrations(Array.isArray(regData) ? regData : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-64 text-gray-500">Loading...</div>;

    const filtered = selectedType === 'all' ? allEvents : allEvents.filter(e => e.event_type === selectedType);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const pageEvents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleTypeChange = (type) => { setSelectedType(type); setPage(1); };

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.full_name}</h1>
                <p className="text-gray-500 text-sm mt-1">Here's what's happening with events today.</p>
                <Link to="/my-events" className="inline-block mt-3 text-sm font-semibold" style={{ color: '#0061ff' }}>
                    View My Registrations →
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="text-white p-5 rounded-xl shadow" style={{ background: '#0061ff' }}>
                    <p className="text-blue-100 text-sm font-medium">Available Events</p>
                    <p className="text-4xl font-bold mt-1">{allEvents.length}</p>
                </div>
                <div className="text-white p-5 rounded-xl shadow" style={{ background: '#0050d0' }}>
                    <p className="text-blue-100 text-sm font-medium">My Registrations</p>
                    <p className="text-4xl font-bold mt-1">{registrations.length}</p>
                </div>
                <div className="text-white p-5 rounded-xl shadow" style={{ background: '#003fa3' }}>
                    <p className="text-blue-100 text-sm font-medium">Attended</p>
                    <p className="text-4xl font-bold mt-1">{registrations.filter(r => r.status === 'attended').length}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap gap-2">
                    {eventTypes.map(t => (
                        <button key={t.value} onClick={() => handleTypeChange(t.value)}
                            style={selectedType === t.value ? { background: '#0061ff' } : {}}
                            className={`px-4 py-2 rounded-lg text-base font-semibold transition ${
                                selectedType === t.value ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Events Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        {selectedType === 'all' ? 'All Events' : `${eventTypes.find(t => t.value === selectedType)?.label} Events`}
                    </h2>
                    <span className="text-sm text-gray-400">
                        {filtered.length} events · Page {page} of {totalPages || 1}
                    </span>
                </div>

                {filtered.length === 0 ? (
                    <p className="text-gray-400 text-center py-10">No events in this category.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pageEvents.map(event => (
                                <div key={event.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition flex flex-col">
                                    {event.image_url ? (
                                        <img src={event.image_url} alt={event.title}
                                            className="w-full h-36 object-cover" loading="lazy" />
                                    ) : (
                                        <div className="w-full h-36 flex items-center justify-center text-5xl"
                                            style={{ background: '#eff6ff' }}>
                                            {typeIcon(event.event_type)}
                                        </div>
                                    )}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-800 text-base leading-snug">{event.title}</h3>
                                            <span className={`ml-2 text-sm px-3 py-1 rounded-full flex-shrink-0 font-semibold ${
                                                isCompleted(event.date, event.time) ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
                                            }`}>
                                                {isCompleted(event.date, event.time) ? 'Completed' : 'Upcoming'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{event.description}</p>
                                        <div className="text-sm text-gray-600 space-y-1 mb-4">
                                            <div>Date/Time: {event.date} &nbsp; {event.time}</div>
                                            <div>Location: {event.location}</div>
                                        </div>
                                        <Link to={`/events/${event.id}`}
                                            style={{ background: '#0061ff' }}
                                            className="block text-center hover:opacity-90 text-white text-base font-semibold py-2.5 rounded-xl transition mt-auto">
                                            View & Register
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <button onClick={() => { setPage(p => p - 1); }} disabled={page === 1}
                                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                    ← Prev
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button key={p} onClick={() => setPage(p)}
                                        style={p === page ? { background: '#0061ff' } : {}}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                                            p === page ? 'text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                                        }`}>
                                        {p}
                                    </button>
                                ))}
                                <button onClick={() => { setPage(p => p + 1); }} disabled={page === totalPages}
                                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
