import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const BLUE = '#0061ff';
const COLORS = ['#0061ff', '#7c3aed', '#10b981', '#f59e0b'];

const EventStats = () => {
    const { getAuthHeaders } = useAuth();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

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

                setRows(approved.map((e, i) => {
                    const list = Array.isArray(regs[i]) ? regs[i] : [];
                    return {
                        name: e.title.length > 18 ? e.title.slice(0, 18) + '…' : e.title,
                        fullTitle: e.title,
                        date: e.date,
                        type: e.event_type,
                        Participants: list.filter(x => x.role_type === 'participant').length,
                        Coordinators: list.filter(x => x.role_type === 'coordinator').length,
                        Attended: list.filter(x => x.status === 'attended').length,
                        total: list.length,
                    };
                }));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-64 text-gray-500">Loading...</div>;

    const totalParticipants = rows.reduce((s, r) => s + r.Participants, 0);
    const totalCoordinators = rows.reduce((s, r) => s + r.Coordinators, 0);
    const totalAttended = rows.reduce((s, r) => s + r.Attended, 0);
    const totalRegistrations = rows.reduce((s, r) => s + r.total, 0);

    // Pie data — registrations by event type
    const typeMap = {};
    rows.forEach(r => {
        typeMap[r.type] = (typeMap[r.type] || 0) + r.total;
    });
    const pieData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        const row = rows.find(r => r.name === label);
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-sm">
                <p className="font-bold text-gray-800 mb-2">{row?.fullTitle || label}</p>
                {payload.map(p => (
                    <p key={p.name} style={{ color: p.color }} className="font-semibold">
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900">Event Statistics</h1>
                <p className="text-gray-500 text-sm mt-1">Visual breakdown of participant data across all approved events</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Approved Events', value: rows.length, color: BLUE },
                    { label: 'Total Participants', value: totalParticipants, color: '#10b981' },
                    { label: 'Coordinators', value: totalCoordinators, color: '#7c3aed' },
                    { label: 'Attended', value: totalAttended, color: '#f59e0b' },
                ].map(c => (
                    <div key={c.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <p className="text-sm text-gray-500">{c.label}</p>
                        <p className="text-4xl font-bold mt-1" style={{ color: c.color }}>{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Bar Chart — Participants per Event */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="font-bold text-gray-800 text-lg mb-6">Participants per Event</h2>
                {rows.length === 0 ? (
                    <p className="text-gray-400 text-center py-12">No data available</p>
                ) : (
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={rows} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} angle={-35} textAnchor="end" interval={0} />
                            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ paddingTop: '16px' }} />
                            <Bar dataKey="Participants" fill={BLUE} radius={[6, 6, 0, 0]} />
                            <Bar dataKey="Coordinators" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="Attended" fill="#10b981" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Bottom Row — Pie + Top Events */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart — Registrations by Event Type */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="font-bold text-gray-800 text-lg mb-6">Registrations by Event Type</h2>
                    {pieData.length === 0 ? (
                        <p className="text-gray-400 text-center py-12">No data</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(v, n) => [v, n]} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Top 5 Events by Participants */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="font-bold text-gray-800 text-lg mb-6">Top Events by Participants</h2>
                    <div className="space-y-4">
                        {[...rows].sort((a, b) => b.Participants - a.Participants).slice(0, 5).map((r, i) => (
                            <div key={r.fullTitle}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold text-gray-700 truncate max-w-[70%]">{r.fullTitle}</span>
                                    <span className="font-bold" style={{ color: BLUE }}>{r.Participants} students</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3">
                                    <div className="h-3 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${rows[0]?.Participants ? Math.round((r.Participants / Math.max(...rows.map(x => x.Participants))) * 100) : 0}%`,
                                            background: COLORS[i % COLORS.length]
                                        }} />
                                </div>
                            </div>
                        ))}
                        {rows.length === 0 && <p className="text-gray-400 text-center py-8">No data</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventStats;
