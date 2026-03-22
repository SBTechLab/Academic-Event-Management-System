import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const BLUE = '#0061ff';

const EventCoordinators = () => {
    const { getAuthHeaders } = useAuth();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        const load = async () => {
            try {
                const events = await fetch('http://localhost:5001/api/events?limit=100').then(r => r.json());
                const approved = Array.isArray(events) ? events.filter(e => e.status === 'approved') : [];

                const regs = await Promise.all(
                    approved.map(e =>
                        fetch(`http://localhost:5001/api/registrations/event/${e.id}`, { headers: getAuthHeaders() })
                            .then(r => r.ok ? r.json() : [])
                            .catch(() => [])
                    )
                );

                const result = approved.map((e, i) => ({
                    ...e,
                    coordinators: (Array.isArray(regs[i]) ? regs[i] : []).filter(
                        r => r.role_type === 'coordinator' && (r.status === 'registered' || r.status === 'approved')
                    ),
                })).filter(e => e.coordinators.length > 0);

                setRows(result);
                // expand all by default
                const exp = {};
                result.forEach(e => { exp[e.id] = true; });
                setExpanded(exp);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-64 text-gray-500">Loading...</div>;

    const filtered = rows.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
    const totalCoords = rows.reduce((s, r) => s + r.coordinators.length, 0);

    const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    const permissionBadges = (perms) => {
        if (!perms || !Array.isArray(perms) || perms.length === 0)
            return <span className="text-xs text-gray-400 italic">No permissions assigned</span>;
        const labels = {
            generate_certificates: 'Certificates',
            view_participants: 'View Participants',
            update_schedule: 'Update Schedule',
            add_details: 'Add Details',
        };
        return perms.map(p => (
            <span key={p} className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full mr-1">
                {labels[p] || p}
            </span>
        ));
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900">Event Coordinators</h1>
                <p className="text-gray-500 text-sm mt-1">Approved coordinators assigned to each event</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <p className="text-sm text-gray-500">Events with Coordinators</p>
                    <p className="text-4xl font-bold mt-1" style={{ color: BLUE }}>{rows.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <p className="text-sm text-gray-500">Total Coordinators</p>
                    <p className="text-4xl font-bold mt-1 text-purple-600">{totalCoords}</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by event name..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': BLUE }}
                />
            </div>

            {/* Event Cards */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
                    No events with approved coordinators found.
                </div>
            ) : (
                filtered.map(event => (
                    <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Event Header */}
                        <button
                            onClick={() => toggle(event.id)}
                            className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                    style={{ background: BLUE }}>
                                    {event.coordinators.length}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-base">{event.title}</p>
                                    <p className="text-sm text-gray-400 mt-0.5">
                                        Date: {event.date} &nbsp;·&nbsp; Location: {event.location} &nbsp;·&nbsp;
                                        <span className="capitalize">{event.event_type}</span>
                                    </p>
                                </div>
                            </div>
                            <span className="text-gray-400 text-lg">{expanded[event.id] ? '▲' : '▼'}</span>
                        </button>

                        {/* Coordinators List */}
                        {expanded[event.id] && (
                            <div className="border-t border-gray-100 divide-y divide-gray-50">
                                {event.coordinators.map((c, idx) => (
                                    <div key={c.id} className="flex items-center gap-4 px-6 py-4">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                            style={{ background: '#7c3aed' }}>
                                            {c.user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm">{c.user?.full_name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-400">{c.user?.email || '—'}</p>
                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                                {permissionBadges(c.coordinator_permissions)}
                                            </div>
                                        </div>
                                        <span className="flex-shrink-0 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                                            Coordinator
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default EventCoordinators;
