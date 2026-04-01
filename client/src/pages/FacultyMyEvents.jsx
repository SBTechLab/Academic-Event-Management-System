import { useState, useEffect, useRef } from 'react';
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

    // Winners modal state
    const [winnersModal, setWinnersModal] = useState(null); // { event }
    const [participants, setParticipants] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [winners, setWinners] = useState([]); // [{ id, full_name, email, position }]
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const inputRef = useRef(null);

    const isCompleted = (date, time) => new Date(`${date}T${time}`) < new Date();

    const loadEvents = async () => {
        try {
            const data = await fetch(`http://localhost:5001/api/events?limit=100&_=${Date.now()}`, { headers: getAuthHeaders() })
                .then(r => r.json());
            setEvents(Array.isArray(data) ? data.filter(e => e.created_by === user.id) : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadEvents(); }, []);
    useEffect(() => {
        const fn = () => { if (document.visibilityState === 'visible') loadEvents(); };
        document.addEventListener('visibilitychange', fn);
        return () => document.removeEventListener('visibilitychange', fn);
    }, []);
    useEffect(() => {
        const t = setInterval(loadEvents, 10000);
        return () => clearInterval(t);
    }, []);

    const openWinnersModal = async (event) => {
        setWinnersModal({ event });
        setSearchQuery('');
        setWinners([]);
        setSaveMsg('');
        setLoadingParticipants(true);
        try {
            const regs = await fetch(`http://localhost:5001/api/registrations/event/${event.id}`, { headers: getAuthHeaders() })
                .then(r => r.json());
            const parts = Array.isArray(regs)
                ? regs.filter(r => r.status === 'attended' || r.status === 'registered')
                : [];
            setParticipants(parts);
        } catch (err) {
            console.error(err);
            setParticipants([]);
        } finally {
            setLoadingParticipants(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const closeModal = () => {
        setWinnersModal(null);
        setParticipants([]);
        setWinners([]);
        setSearchQuery('');
        setSaveMsg('');
    };

    // Fuzzy filter: match any part of name or email
    const filtered = searchQuery.trim().length > 0
        ? participants.filter(p => {
            const q = searchQuery.toLowerCase();
            return (
                p.user?.full_name?.toLowerCase().includes(q) ||
                p.user?.email?.toLowerCase().includes(q)
            );
          }).filter(p => !winners.find(w => w.id === p.student_id))
        : [];

    const addWinner = (participant, position) => {
        if (winners.find(w => w.id === participant.student_id)) return;
        if (winners.length >= 3) return;
        setWinners(prev => [...prev, {
            id: participant.student_id,
            full_name: participant.user?.full_name || 'Unknown',
            email: participant.user?.email || '',
            position: prev.length
        }]);
        setSearchQuery('');
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const removeWinner = (id) => setWinners(prev => prev.filter(w => w.id !== id));

    const positionLabel = (i) => {
        const labels = ['1st Place', '2nd Place', '3rd Place'];
        return labels[i] || `${i + 1}th Place`;
    };

    const handleSave = async () => {
        if (winners.length === 0) return;
        setSaving(true);
        setSaveMsg('');
        try {
            // Save winners as event update_reason field (or you can extend with a winners table)
            const winnersText = winners.map((w, i) => `${positionLabel(i)}: ${w.full_name} (${w.email})`).join(' | ');
            const res = await fetch(`http://localhost:5001/api/events/${winnersModal.event.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ winners: winnersText })
            });
            if (res.ok) {
                setSaveMsg('Winners saved successfully!');
                loadEvents();
                setTimeout(closeModal, 1500);
            } else {
                setSaveMsg('Failed to save. Please try again.');
            }
        } catch (err) {
            setSaveMsg('Error saving winners.');
        } finally {
            setSaving(false);
        }
    };

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
                <div className="flex gap-3 items-center">
                    <Link to="/create-event"
                        className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition"
                        style={{ background: BLUE }}>
                        + Create Event
                    </Link>
                </div>
            </div>

            {events.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                    <p className="text-gray-500 text-lg font-medium">You haven't created any events yet.</p>
                    <Link to="/create-event" className="inline-block mt-4 font-semibold text-sm" style={{ color: BLUE }}>
                        Create your first event →
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {pageEvents.map(event => {
                            const completed = isCompleted(event.date, event.time) && event.status === 'approved';
                            return (
                            <div key={event.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                                {event.image_url ? (
                                    <img src={event.image_url} alt={event.title} className="w-full h-40 object-cover" loading="lazy" />
                                ) : (
                                    <div className="w-full h-40 flex items-center justify-center text-5xl" style={{ background: '#eff6ff' }}>
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
                                        {event.winners && (
                                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                                                Winners: {event.winners}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-auto">
                                        {completed ? (
                                            <button
                                                onClick={() => openWinnersModal(event)}
                                                className="flex-1 text-center text-white text-sm font-semibold py-2 rounded-xl hover:opacity-90 transition"
                                                style={{ background: '#f59e0b' }}>
                                                Add Winners
                                            </button>
                                        ) : (
                                            <Link to={`/events/${event.id}`}
                                                className="flex-1 text-center text-sm font-semibold py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
                                                View
                                            </Link>
                                        )}
                                        <Link to={`/events/${event.id}/edit`}
                                            className="flex-1 text-center text-white text-sm font-semibold py-2 rounded-xl hover:opacity-90 transition"
                                            style={{ background: BLUE }}>
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );})}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)}
                                    style={p === page ? { background: BLUE } : {}}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${p === page ? 'text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                                    {p}
                                </button>
                            ))}
                            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Winners Modal */}
            {winnersModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Add Winners</h3>
                                <p className="text-sm text-gray-500 mt-0.5">{winnersModal.event.title}</p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">×</button>
                        </div>

                        {/* Search Input */}
                        <div className="relative mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Search Participants</p>
                                <p className="text-xs text-gray-400">{winners.length}/3 winners selected</p>
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={winners.length >= 3 ? 'Maximum 3 winners selected' : `Search for ${winners.length === 0 ? '1st' : winners.length === 1 ? '2nd' : '3rd'} place...`}
                                disabled={winners.length >= 3}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                            />
                            {/* Dropdown suggestions */}
                            {filtered.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
                                    {filtered.map(p => (
                                        <div key={p.student_id} className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{p.user?.full_name}</p>
                                                    <p className="text-xs text-gray-400">{p.user?.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => addWinner(p, winners.length)}
                                                    className="text-xs font-bold text-white px-3 py-1 rounded-lg"
                                                    style={{ background: BLUE }}>
                                                    + Add
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {searchQuery.trim().length > 0 && filtered.length === 0 && !loadingParticipants && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 mt-1 px-4 py-3 text-sm text-gray-400">
                                    No matching participants found
                                </div>
                            )}
                        </div>

                        {loadingParticipants && (
                            <p className="text-sm text-gray-400 text-center py-4">Loading participants...</p>
                        )}

                        {/* Winners List - always show 3 slots */}
                        <div className="mb-5">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Selected Winners</p>
                            <div className="space-y-2">
                                {[0, 1, 2].map(i => {
                                    const w = winners[i];
                                    const medals = ['🥇', '🥈', '🥉'];
                                    const colors = [
                                        { border: '#f59e0b', bg: '#fffbeb', text: '#d97706' },
                                        { border: '#9ca3af', bg: '#f9fafb', text: '#6b7280' },
                                        { border: '#b45309', bg: '#fef3c7', text: '#92400e' },
                                    ];
                                    const positions = ['1st Place', '2nd Place', '3rd Place'];
                                    return w ? (
                                        <div key={w.id} className="flex items-center justify-between px-4 py-3 rounded-xl border"
                                            style={{ borderColor: colors[i].border, background: colors[i].bg }}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{medals[i]}</span>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{w.full_name}</p>
                                                    <p className="text-xs text-gray-400">{w.email}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => removeWinner(w.id)} className="text-red-400 hover:text-red-600 text-lg font-bold">×</button>
                                        </div>
                                    ) : (
                                        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-gray-200 bg-gray-50">
                                            <span className="text-lg opacity-30">{medals[i]}</span>
                                            <p className="text-sm text-gray-300 italic">{positions[i]} — not selected</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {participants.length === 0 && !loadingParticipants && (
                            <p className="text-sm text-gray-400 text-center py-4 mb-4">No participants found for this event.</p>
                        )}

                        {saveMsg && (
                            <p className={`text-sm font-semibold text-center mb-3 ${saveMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                                {saveMsg}
                            </p>
                        )}

                        <div className="flex gap-3">
                            <button onClick={closeModal}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold text-sm">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving || winners.length === 0}
                                className="flex-1 px-4 py-2.5 text-white rounded-xl font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition"
                                style={{ background: '#f59e0b' }}>
                                {saving ? 'Saving...' : 'Save Winners'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyMyEvents;
