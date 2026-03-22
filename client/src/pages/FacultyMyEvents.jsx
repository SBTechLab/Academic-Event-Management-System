import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 9;
const BLUE = '#0061ff';

const typeIcon = (t) => t.charAt(0).toUpperCase();

const FacultyMyEvents = () => {
    const { user, getAuthHeaders } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const isCompleted = (date, time) => new Date(`${date}T${time}`) < new Date();

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetch('http://localhost:5001/api/events?limit=100', { headers: getAuthHeaders() })
                    .then(r => r.json());
                setEvents(Array.isArray(data) ? data.filter(e => e.created_by === user.id) : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-64 text-gray-500">Loading...</div>;

    const totalPages = Math.ceil(events.length / PAGE_SIZE);
    const pageEvents = events.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const statusStyle = (s) => ({
        approved: 'bg-green-100 text-green-700',
        pending:  'bg-yellow-100 text-yellow-700',
        rejected: 'bg-red-100 text-red-700',
    }[s] || 'bg-gray-100 text-gray-600');

    const statusLabel = (e) => {
        if (e.status === 'approved' && isCompleted(e.date, e.time)) return 'Completed';
        if (e.status === 'approved') return 'Upcoming';
        if (e.status === 'pending')  return 'Pending';
        return 'Rejected';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Events</h1>
                    <p className="text-gray-500 text-sm mt-1">{events.length} events created by you</p>
                </div>
                <Link to="/create-event"
                    className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition"
                    style={{ background: BLUE }}>
                    + Create Event
                </Link>
            </div>

            {events.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                    <p className="text-5xl mb-4 text-gray-300">No Events</p>
                    <p className="text-gray-500 text-lg font-medium">You haven't created any events yet.</p>
                    <Link to="/create-event" className="inline-block mt-4 font-semibold text-sm" style={{ color: BLUE }}>
                        Create your first event →
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {pageEvents.map(event => (
                            <div key={event.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                                {event.image_url ? (
                                    <img src={event.image_url} alt={event.title}
                                        className="w-full h-40 object-cover" loading="lazy" />
                                ) : (
                                    <div className="w-full h-40 flex items-center justify-center text-5xl"
                                        style={{ background: '#eff6ff' }}>
                                        {typeIcon(event.event_type)}
                                    </div>
                                )}
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex items-start justify-between mb-2 gap-2">
                                        <h3 className="font-bold text-gray-900 text-base leading-snug">{event.title}</h3>
                                        <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle(event.status)}`}>
                                            {statusLabel(event)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{event.description}</p>
                                    <div className="text-sm text-gray-600 space-y-1 mb-4">
                                        <div>Date: {event.date} &nbsp; Time: {event.time}</div>
                                        <div>Location: {event.location}</div>
                                        {event.rejection_reason && (
                                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                                                Rejection: {event.rejection_reason}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-auto">
                                        <Link to={`/events/${event.id}`}
                                            className="flex-1 text-center text-sm font-semibold py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
                                            View
                                        </Link>
                                        <Link to={`/events/${event.id}/edit`}
                                            className="flex-1 text-center text-white text-sm font-semibold py-2 rounded-xl hover:opacity-90 transition"
                                            style={{ background: BLUE }}>
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                ← Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)}
                                    style={p === page ? { background: BLUE } : {}}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                                        p === page ? 'text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                                    }`}>
                                    {p}
                                </button>
                            ))}
                            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FacultyMyEvents;
