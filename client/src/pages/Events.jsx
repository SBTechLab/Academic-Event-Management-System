import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchWithCache } from '../cacheUtils';

const PAGE_SIZE = 9;

const Events = () => {
    const { role } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);

    const isEventCompleted = (eventDate, eventTime) => {
        return new Date(`${eventDate}T${eventTime}`) < new Date();
    };

    const getEventStatus = (event) => {
        if (event.status === 'cancelled') return { label: 'Cancelled', color: 'bg-red-100 text-red-700' };
        if (event.status === 'approved' && isEventCompleted(event.date, event.time)) return { label: 'Completed', color: 'bg-gray-100 text-gray-600' };
        if (event.status === 'approved') return { label: 'Upcoming', color: 'bg-green-100 text-green-700' };
        return { label: event.status, color: 'bg-yellow-100 text-yellow-700' };
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await fetchWithCache('http://localhost:5001/api/events?limit=50');
                const filtered = (role === 'student' || role === 'student_coordinator')
                    ? data.filter(e => e.status === 'approved' || e.status === 'cancelled')
                    : data;
                setEvents(filtered);
            } catch (err) {
                setError(err.message || 'Failed to fetch events');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [role]);

    if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading events...</div>;
    if (error) return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>;

    const totalPages = Math.ceil(events.length / PAGE_SIZE);
    const pageEvents = events.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const goToPage = (p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800">Browse Events</h1>
                <p className="text-gray-500 text-sm mt-1">{events.length} events available</p>
            </div>

            {events.length === 0 ? (
                <div className="bg-white rounded-xl border p-12 text-center">
                    <p className="text-gray-500">No events available at the moment.</p>
                </div>
            ) : (
                <>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {pageEvents.map(event => {
                            const status = getEventStatus(event);
                            return (
                                <div key={event.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col">
                                    {event.image_url ? (
                                        <img src={event.image_url} alt={event.title}
                                            className="w-full h-44 object-cover rounded-t-xl" loading="lazy" />
                                    ) : (
                                        <div className="w-full h-44 rounded-t-xl flex items-center justify-center text-5xl"
                                            style={{ background: '#eff6ff' }}>
                                            {event.event_type ? event.event_type.charAt(0).toUpperCase() : 'E'}
                                        </div>
                                    )}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-gray-900 text-lg leading-snug">{event.title}</h3>
                                            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                                            <div>Date: {new Date(event.date).toLocaleDateString()}</div>
                                            <div>Time: {event.time}</div>
                                            <div>Location: {event.location}</div>
                                        </div>
                                        <p className="text-gray-500 text-base mb-4 line-clamp-2 flex-1">{event.description}</p>
                                        <Link
                                            to={`/events/${event.id}`}
                                            className={`block text-center py-3 rounded-xl text-base font-semibold transition ${
                                                status.label === 'Cancelled'
                                                    ? 'bg-gray-200 text-gray-500 pointer-events-none'
                                                    : 'text-white hover:opacity-90'
                                            }`}
                                            style={status.label !== 'Cancelled' ? { background: '#0061ff' } : {}}
                                            onClick={e => status.label === 'Cancelled' && e.preventDefault()}
                                        >
                                            {status.label === 'Cancelled' ? 'Cancelled' : 'View Details'}
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                                onClick={() => goToPage(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                ← Prev
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => goToPage(p)}
                                    style={p === page ? { background: '#0061ff' } : {}}
                                    className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                                        p === page
                                            ? 'text-white'
                                            : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}

                            <button
                                onClick={() => goToPage(page + 1)}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Events;
