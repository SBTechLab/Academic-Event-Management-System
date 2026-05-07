import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isEventCompleted } from '../eventUtils';

const BLUE = '#0061ff';

// ── Manage Registrations Tab ──
const RegistrationsTab = ({ participants, onRefresh, getAuthHeaders, isCompleted }) => {
    const all = participants.filter(p => p.role_type === 'participant');

    const updateStatus = async (id, status) => {
        await fetch(`http://localhost:5001/api/registrations/${id}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        onRefresh();
    };

    return (
        <div className="space-y-3">
            <h3 className="font-bold text-gray-800 text-base">Manage Registrations ({all.length})</h3>
            {all.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No participants registered yet.</p>
            ) : all.map(p => (
                <div key={p.id} className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-xl">
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">{p.user?.full_name}</p>
                        <p className="text-xs text-gray-400">{p.user?.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            p.status === 'attended' ? 'bg-green-100 text-green-700' :
                            p.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-700'
                        }`}>{p.status}</span>
                        {!isCompleted && p.status !== 'cancelled' && (
                            <button onClick={() => updateStatus(p.id, 'cancelled')}
                                className="text-xs text-red-500 hover:text-red-700 font-semibold border border-red-200 px-2 py-1 rounded-lg">
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const CoordinatorDashboard = () => {
    const { eventId } = useParams();
    const { getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(null);

    useEffect(() => { fetchCoordinatorData(); }, [eventId]);

    // Refresh when page becomes visible (tab focus)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchCoordinatorData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [eventId]);

    // Refresh every 10 seconds for real-time updates
    useEffect(() => {
        const interval = setInterval(fetchCoordinatorData, 10000);
        return () => clearInterval(interval);
    }, [eventId]);

    const fetchCoordinatorData = async () => {
        try {
            const [eventRes, regRes, myRegRes] = await Promise.all([
                fetch(`http://localhost:5001/api/events/${eventId}`),
                fetch(`http://localhost:5001/api/registrations/event/${eventId}`, { headers: getAuthHeaders() }),
                fetch('http://localhost:5001/api/registrations/my-registrations', { headers: getAuthHeaders() }),
            ]);

            if (eventRes.ok) setEvent(await eventRes.json());
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
                else if (perms.includes('manage_registrations')) setActiveTab('registrations');
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
            else console.error('Failed:', await res.json());
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="flex justify-center items-center h-64 text-gray-500">Loading...</div>;
    if (!event) return <div className="text-center py-10 text-red-500">Event not found</div>;

    const isCompleted = event && isEventCompleted(event.date, event.time);

    const tabs = [
        has('view_participants')    && { key: 'participants',  label: 'Participants' },
        has('mark_attendance')      && { key: 'attendance',    label: 'Attendance' },
        has('manage_event_details') && { key: 'details',       label: 'Event Details' },
        has('manage_registrations') && { key: 'registrations', label: 'Registrations' },
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
                {isCompleted && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3">
                        <p className="text-sm text-green-700 font-semibold">This event has been completed. Dashboard is in read-only mode.</p>
                    </div>
                )}
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
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
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
                                <h3 className="font-bold text-gray-800 text-base mb-4">Mark Attendance ({onlyParticipants.length} participants)</h3>
                                {onlyParticipants.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8">No participants registered yet</p>
                                ) : (
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
                                                        disabled={p.status === 'attended' || isCompleted}
                                                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                                                            p.status === 'attended' || isCompleted
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'bg-green-600 text-white hover:bg-green-700'
                                                        }`}>
                                                        {p.status === 'attended' ? 'Present ✓' : 'Mark Present'}
                                                    </button>
                                                    {p.status === 'attended' && !isCompleted && (
                                                        <button onClick={() => handleMarkAttendance(p.id, false)}
                                                            className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-300 transition">
                                                            Undo
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
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

                        {/* Announcements Tab */}
                        {activeTab === 'announcements' && has('send_announcements') && (
                            <AnnouncementsTab eventId={eventId} getAuthHeaders={getAuthHeaders} participants={onlyParticipants} />
                        )}

                        {/* Reports Tab */}
                        {activeTab === 'reports' && has('generate_reports') && (
                            <ReportsTab event={event} participants={onlyParticipants} attendedCount={attendedCount} />
                        )}

                        {/* Manage Registrations Tab */}
                        {activeTab === 'registrations' && has('manage_registrations') && (
                            <RegistrationsTab participants={participants} onRefresh={fetchCoordinatorData} getAuthHeaders={getAuthHeaders} isCompleted={isCompleted} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoordinatorDashboard;
