import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BLUE = '#0061ff';

const CoordinatorDashboard = () => {
    const { eventId } = useParams();
    const { getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(null);
    const [attendanceMode, setAttendanceMode] = useState(null); // 'manual' | 'qr'
    const [qrVisible, setQrVisible] = useState({});

    useEffect(() => { fetchCoordinatorData(); }, [eventId]);

    const fetchCoordinatorData = async () => {
        try {
            const [eventRes, regRes, myRegRes] = await Promise.all([
                fetch(`http://localhost:5001/api/events/${eventId}`),
                fetch(`http://localhost:5001/api/registrations/event/${eventId}`, { headers: getAuthHeaders() }),
                fetch('http://localhost:5001/api/registrations/my-registrations', { headers: getAuthHeaders() }),
            ]);

            if (eventRes.ok) setEvent(await eventRes.ok && eventRes.json());
            const regs = regRes.ok ? await regRes.json() : [];
            setParticipants(Array.isArray(regs) ? regs : []);

            if (myRegRes.ok) {
                const myRegs = await myRegRes.json();
                const myCoordReg = (Array.isArray(myRegs) ? myRegs : []).find(r =>
                    r.event_id === eventId && r.role_type === 'coordinator' && r.status === 'registered'
                );
                const perms = Array.isArray(myCoordReg?.coordinator_permissions) ? myCoordReg.coordinator_permissions : [];
                setPermissions(perms);
                // Set default tab
                if (perms.includes('view_participants')) setActiveTab('participants');
                else if (perms.includes('mark_attendance')) setActiveTab('attendance');
                else if (perms.includes('manage_event_details')) setActiveTab('details');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch event after async set
    useEffect(() => {
        if (!event && !loading) {
            fetch(`http://localhost:5001/api/events/${eventId}`)
                .then(r => r.ok ? r.json() : null)
                .then(d => d && setEvent(d));
        }
    }, [loading]);

    const has = (p) => permissions.includes(p);

    const handleMarkAttendance = async (regId, attended) => {
        try {
            const res = await fetch(`http://localhost:5001/api/registrations/${regId}/status`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: attended ? 'attended' : 'registered' })
            });
            if (res.ok) fetchCoordinatorData();
        } catch (err) { console.error(err); }
    };

    // Simple QR: encode participant name + email as a data URL using a free API
    const getQrUrl = (text) =>
        `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(text)}`;

    if (loading) return <div className="flex justify-center items-center h-64 text-gray-500">Loading...</div>;
    if (!event) return <div className="text-center py-10 text-red-500">Event not found</div>;

    const tabs = [
        has('view_participants')    && { key: 'participants', label: 'Participants' },
        has('mark_attendance')      && { key: 'attendance',   label: 'Attendance' },
        has('manage_event_details') && { key: 'details',      label: 'Event Details' },
    ].filter(Boolean);

    const onlyParticipants = participants.filter(p => p.role_type === 'participant');
    const attendedCount = participants.filter(p => p.status === 'attended').length;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <button onClick={() => navigate('/my-events')}
                    className="text-sm font-semibold mb-4 flex items-center gap-1 hover:opacity-70 transition"
                    style={{ color: BLUE }}>
                    ← Back to My Events
                </button>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Coordinator Dashboard</h1>
                        <h2 className="text-lg font-semibold text-gray-600 mt-1">{event.title}</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                            <span>Date: {event.date}</span>
                            <span>Time: {event.time}</span>
                            <span>Location: {event.location}</span>
                        </div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                        style={{ background: BLUE }}>C</div>
                </div>
            </div>

            {/* Permissions + Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Your Permissions</p>
                    {permissions.length === 0 ? (
                        <p className="text-sm text-gray-400">No permissions granted yet.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {permissions.map(p => (
                                <span key={p} className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700">
                                    {p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Attendance</p>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-4xl font-extrabold text-green-600">{attendedCount}</span>
                        <span className="text-gray-400 text-lg mb-1">/ {onlyParticipants.length}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">participants attended</p>
                </div>
            </div>

            {/* Tabs */}
            {tabs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
                    No permissions granted. Contact faculty for access.
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Tab Bar */}
                    <div className="flex border-b border-gray-200">
                        {tabs.map(tab => (
                            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setAttendanceMode(null); }}
                                className={`flex-1 py-4 text-sm font-semibold transition ${
                                    activeTab === tab.key
                                        ? 'border-b-2 bg-blue-50 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                                style={activeTab === tab.key ? { borderBottomColor: BLUE } : {}}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {/* Participants Tab */}
                        {activeTab === 'participants' && has('view_participants') && (
                            <div>
                                <h3 className="font-bold text-gray-800 text-base mb-4">
                                    Registered Participants ({onlyParticipants.length})
                                </h3>
                                {onlyParticipants.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8">No participants yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {onlyParticipants.map(p => (
                                            <div key={p.id} className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-xl">
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{p.user?.full_name}</p>
                                                    <p className="text-xs text-gray-400">{p.user?.email}</p>
                                                </div>
                                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                                    p.status === 'attended' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {p.status === 'attended' ? 'Attended' : 'Registered'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Attendance Tab */}
                        {activeTab === 'attendance' && has('mark_attendance') && (
                            <div>
                                {/* Mode selector */}
                                {!attendanceMode ? (
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-base mb-6">How would you like to take attendance?</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <button onClick={() => setAttendanceMode('manual')}
                                                className="flex flex-col items-center gap-3 p-8 border-2 rounded-2xl hover:shadow-md transition hover:border-blue-400 group">
                                                <span className="text-4xl text-blue-600 font-bold leading-none">✓</span>
                                                <p className="font-bold text-gray-800 text-lg group-hover:text-blue-600">Mark Attendance</p>
                                                <p className="text-sm text-gray-400 text-center">Manually mark each participant as present or absent</p>
                                            </button>
                                            <button onClick={() => setAttendanceMode('qr')}
                                                className="flex flex-col items-center gap-3 p-8 border-2 rounded-2xl hover:shadow-md transition hover:border-blue-400 group">
                                                <span className="text-4xl text-blue-600 font-bold leading-none">QR</span>
                                                <p className="font-bold text-gray-800 text-lg group-hover:text-blue-600">Generate QR Codes</p>
                                                <p className="text-sm text-gray-400 text-center">Generate individual QR codes for each participant</p>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center gap-3 mb-5">
                                            <button onClick={() => setAttendanceMode(null)}
                                                className="text-sm font-semibold hover:opacity-70 transition"
                                                style={{ color: BLUE }}>← Back</button>
                                            <h3 className="font-bold text-gray-800 text-base">
                                                {attendanceMode === 'manual' ? 'Mark Attendance' : 'QR Codes'}
                                            </h3>
                                        </div>

                                        {onlyParticipants.length === 0 ? (
                                            <p className="text-gray-400 text-center py-8">No participants registered yet</p>
                                        ) : attendanceMode === 'manual' ? (
                                            <div className="space-y-2">
                                                {onlyParticipants.map(p => (
                                                    <div key={p.id} className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-xl">
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">{p.user?.full_name}</p>
                                                            <p className="text-xs text-gray-400">{p.user?.email}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleMarkAttendance(p.id, true)}
                                                                disabled={p.status === 'attended'}
                                                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                                                                    p.status === 'attended'
                                                                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                                }`}>
                                                                {p.status === 'attended' ? 'Present' : 'Mark Present'}
                                                            </button>
                                                            {p.status === 'attended' && (
                                                                <button onClick={() => handleMarkAttendance(p.id, false)}
                                                                    className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-300 transition">
                                                                    Undo
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            // QR Mode
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {onlyParticipants.map(p => (
                                                    <div key={p.id} className="border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-3">
                                                        <div className="text-center">
                                                            <p className="font-semibold text-gray-900 text-sm">{p.user?.full_name}</p>
                                                            <p className="text-xs text-gray-400">{p.user?.email}</p>
                                                        </div>
                                                        {qrVisible[p.id] ? (
                                                            <>
                                                                <img
                                                                    src={getQrUrl(`${event.title}\n${p.user?.full_name}\n${p.user?.email}`)}
                                                                    alt="QR Code"
                                                                    className="w-40 h-40 rounded-lg border border-gray-200"
                                                                />
                                                                <button onClick={() => setQrVisible(prev => ({ ...prev, [p.id]: false }))}
                                                                    className="text-xs text-gray-400 hover:text-gray-600">
                                                                    Hide QR
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button onClick={() => setQrVisible(prev => ({ ...prev, [p.id]: true }))}
                                                                className="px-4 py-2 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition"
                                                                style={{ background: BLUE }}>
                                                                Show QR Code
                                                            </button>
                                                        )}
                                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                                            p.status === 'attended' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                            {p.status === 'attended' ? 'Attended' : 'Not yet attended'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Event Details Tab */}
                        {activeTab === 'details' && has('manage_event_details') && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 text-base mb-2">Event Information</h3>
                                {[
                                    { label: 'Title', value: event.title },
                                    { label: 'Description', value: event.description },
                                    { label: 'Date', value: event.date },
                                    { label: 'Time', value: event.time },
                                    { label: 'Location', value: event.location },
                                    { label: 'Type', value: event.event_type },
                                ].map(f => (
                                    <div key={f.label}>
                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{f.label}</p>
                                        <p className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm">{f.value || '—'}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoordinatorDashboard;
