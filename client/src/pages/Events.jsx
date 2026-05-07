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
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('none');
    const [category, setCategory] = useState('all');

    const CATEGORIES = ['all', 'technical', 'cultural', 'sports', 'workshop', 'seminar', 'competition', 'general'];

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

    // Refresh when page becomes visible (tab focus)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const fetchEvents = async () => {
                    try {
                        const data = await fetchWithCache('http://localhost:5001/api/events?limit=50');
                        const filtered = (role === 'student' || role === 'student_coordinator')
                            ? data.filter(e => e.status === 'approved' || e.status === 'cancelled')
                            : data;
                        setEvents(filtered);
                    } catch (err) {
                        setError(err.message || 'Failed to fetch events');
                    }
                };
                fetchEvents();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [role]);

    // Refresh every 10 seconds for real-time updates
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const data = await fetchWithCache('http://localhost:5001/api/events?limit=50');
                const filtered = (role === 'student' || role === 'student_coordinator')
                    ? data.filter(e => e.status === 'approved' || e.status === 'cancelled')
                    : data;
                setEvents(filtered);
            } catch (err) {
                console.error('Failed to refresh events:', err);
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [role]);

    if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading events...</div>;
    if (error) return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>;

    const filtered = events
        .filter(e => e.title.toLowerCase().includes(search.toLowerCase()))
        .filter(e => category === 'all' || e.event_type === category)
        .sort((a, b) =>
            sort === 'asc' ? a.title.localeCompare(b.title) :
            sort === 'desc' ? b.title.localeCompare(a.title) : 0
        );

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const pageEvents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const goToPage = (p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Browse Events</h1>
                        <p className="text-gray-500 text-sm mt-1">{filtered.length} events available</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {/* Search Bar */}
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                className="pl-9 pr-4 py-2.5 w-64 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                                style={{ '--tw-ring-color': '#0061ff' }}
                            />
                        </div>

                        {/* Sort Buttons */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                            <span className="text-xs font-semibold text-gray-400 px-2 tracking-wide uppercase">Sort</span>
                            {[{ val: 'none', label: 'Default' }, { val: 'asc', label: 'A → Z' }, { val: 'desc', label: 'Z → A' }].map(({ val, label }) => (
                                <button
                                    key={val}
                                    onClick={() => setSort(val)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                                        sort === val
                                            ? 'text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                                    }`}
                                    style={sort === val ? { background: '#0061ff' } : {}}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
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
