import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CoordinatorDashboard = () => {
    const { eventId } = useParams();
    const { getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [debugInfo, setDebugInfo] = useState('');

    useEffect(() => {
        fetchCoordinatorData();
    }, [eventId]);

    useEffect(() => {
        // Set default active tab based on permissions
        if (permissions.length > 0) {
            if (hasPermission('view_participants')) {
                setActiveTab('participants');
            } else if (hasPermission('mark_attendance')) {
                setActiveTab('attendance');
            } else if (hasPermission('manage_event_details')) {
                setActiveTab('details');
            }
        }
    }, [permissions]);

    const fetchCoordinatorData = async () => {
        try {
            setDebugInfo('Fetching event...');
            // Fetch event details
            const eventRes = await fetch(`http://localhost:5001/api/events/${eventId}`);
            if (eventRes.ok) {
                const eventData = await eventRes.json();
                setEvent(eventData);
                setDebugInfo('Event loaded');
            }

            setDebugInfo('Fetching registrations...');
            // Fetch coordinator permissions and participants
            const regRes = await fetch(`http://localhost:5001/api/registrations/event/${eventId}`, {
                headers: getAuthHeaders()
            });
            if (regRes.ok) {
                const regs = await regRes.json();
                console.log('All registrations:', regs);
                setParticipants(regs);
                setDebugInfo(`Found ${regs.length} registrations`);
                
                // Fetch my registrations to find coordinator permissions
                const myRegRes = await fetch('http://localhost:5001/api/registrations/my-registrations', {
                    headers: getAuthHeaders()
                });
                if (myRegRes.ok) {
                    const myRegs = await myRegRes.json();
                    console.log('My registrations:', myRegs);
                    setDebugInfo(`My registrations: ${myRegs.length}`);
                    
                    // Find coordinator registration for this event
                    const myCoordReg = myRegs.find(r => 
                        r.event_id === eventId && 
                        r.role_type === 'coordinator' && 
                        r.status === 'registered'
                    );
                    
                    console.log('My coordinator registration:', myCoordReg);
                    
                    if (myCoordReg) {
                        setDebugInfo('Found coordinator registration');
                        if (myCoordReg.coordinator_permissions) {
                            console.log('Permissions:', myCoordReg.coordinator_permissions);
                            const perms = Array.isArray(myCoordReg.coordinator_permissions) 
                                ? myCoordReg.coordinator_permissions 
                                : [];
                            setPermissions(perms);
                            setDebugInfo(`Permissions loaded: ${perms.length}`);
                        } else {
                            setDebugInfo('No permissions in registration');
                            setPermissions([]);
                        }
                    } else {
                        setDebugInfo('No coordinator registration found for this event');
                        setPermissions([]);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching coordinator data:', error);
            setDebugInfo(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const hasPermission = (permission) => {
        return Array.isArray(permissions) && permissions.includes(permission);
    };

    const handleMarkAttendance = async (registrationId, attended) => {
        try {
            const response = await fetch(`http://localhost:5001/api/registrations/${registrationId}/status`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: attended ? 'attended' : 'registered' })
            });
            if (response.ok) {
                fetchCoordinatorData();
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (!event) {
        return <div className="text-center py-10 text-red-500">Event not found</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <button onClick={() => navigate('/my-events')} className="text-blue-600 hover:text-blue-800 mb-4">
                        ← Back to My Events
                    </button>
                    <h1 className="text-4xl font-bold text-gray-800">Coordinator Dashboard</h1>
                    <h2 className="text-2xl text-gray-600 mt-2">{event.title}</h2>
                    <div className="flex gap-6 text-sm text-gray-600 mt-3">
                        <span>📅 {event.date}</span>
                        <span>🕐 {event.time}</span>
                        <span>📍 {event.location}</span>
                    </div>
                </div>

                {/* Debug Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800">Debug: {debugInfo}</p>
                    <p className="text-xs text-yellow-600 mt-1">Event ID: {eventId}</p>
                    <p className="text-xs text-yellow-600">Permissions: {JSON.stringify(permissions)}</p>
                    <p className="text-xs text-yellow-600">Participants: {participants.length}</p>
                </div>

                {/* Permissions Overview */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Your Permissions</h3>
                    <div className="flex flex-wrap gap-2">
                        {permissions.length === 0 ? (
                            <p className="text-gray-500">No permissions granted yet</p>
                        ) : (
                            permissions.map(perm => (
                                <span key={perm} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                    {perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            ))
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <p className="text-sm text-gray-500">Total Participants</p>
                        <p className="text-4xl font-bold text-gray-900 mt-2">
                            {participants.filter(p => p.role_type === 'participant').length}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <p className="text-sm text-gray-500">Attended</p>
                        <p className="text-4xl font-bold text-green-600 mt-2">
                            {participants.filter(p => p.status === 'attended').length}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <p className="text-sm text-gray-500">Registered</p>
                        <p className="text-4xl font-bold text-blue-600 mt-2">
                            {participants.filter(p => p.status === 'registered' && p.role_type === 'participant').length}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex-1 py-4 font-medium transition ${
                                activeTab === 'overview' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700'
                            }`}>
                            Overview
                        </button>
                        {hasPermission('view_participants') && (
                            <button
                                onClick={() => setActiveTab('participants')}
                                className={`flex-1 py-4 font-medium transition ${
                                    activeTab === 'participants' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700'
                                }`}>
                                Participants
                            </button>
                        )}
                        {hasPermission('mark_attendance') && (
                            <button
                                onClick={() => setActiveTab('attendance')}
                                className={`flex-1 py-4 font-medium transition ${
                                    activeTab === 'attendance' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700'
                                }`}>
                                Attendance
                            </button>
                        )}
                        {hasPermission('manage_event_details') && (
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`flex-1 py-4 font-medium transition ${
                                    activeTab === 'details' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700'
                                }`}>
                                Event Details
                            </button>
                        )}
                    </div>

                    <div className="p-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Coordinator Overview</h3>
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-blue-900 mb-2">Your Permissions</h4>
                                        {permissions.length === 0 ? (
                                            <p className="text-sm text-blue-700">No permissions granted yet. Contact faculty.</p>
                                        ) : (
                                            <ul className="text-sm text-blue-700 space-y-1">
                                                {permissions.map(perm => (
                                                    <li key={perm}>✓ {perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-green-900 mb-2">Quick Stats</h4>
                                        <p className="text-sm text-green-700">Total Participants: {participants.filter(p => p.role_type === 'participant').length}</p>
                                        <p className="text-sm text-green-700">Attended: {participants.filter(p => p.status === 'attended').length}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Participants Tab */}
                        {activeTab === 'participants' && hasPermission('view_participants') && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Registered Participants</h3>
                                {participants.filter(p => p.role_type === 'participant').length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No participants yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {participants.filter(p => p.role_type === 'participant').map((participant) => (
                                            <div key={participant.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{participant.user?.full_name}</p>
                                                    <p className="text-sm text-gray-600">{participant.user?.email}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    participant.status === 'attended' ? 'bg-green-100 text-green-700' :
                                                    participant.status === 'registered' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {participant.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Attendance Tab */}
                        {activeTab === 'attendance' && hasPermission('mark_attendance') && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Mark Attendance</h3>
                                {participants.filter(p => p.role_type === 'participant').length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No participants to mark attendance</p>
                                ) : (
                                    <div className="space-y-3">
                                        {participants.filter(p => p.role_type === 'participant').map((participant) => (
                                            <div key={participant.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{participant.user?.full_name}</p>
                                                    <p className="text-sm text-gray-600">{participant.user?.email}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleMarkAttendance(participant.id, true)}
                                                        disabled={participant.status === 'attended'}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                                            participant.status === 'attended'
                                                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                                                : 'bg-green-600 text-white hover:bg-green-700'
                                                        }`}>
                                                        {participant.status === 'attended' ? '✓ Present' : 'Mark Present'}
                                                    </button>
                                                    {participant.status === 'attended' && (
                                                        <button
                                                            onClick={() => handleMarkAttendance(participant.id, false)}
                                                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition">
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
                        {activeTab === 'details' && hasPermission('manage_event_details') && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Event Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <p className="p-3 bg-gray-50 rounded-lg">{event.title}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <p className="p-3 bg-gray-50 rounded-lg">{event.description}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                            <p className="p-3 bg-gray-50 rounded-lg">{event.date}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                            <p className="p-3 bg-gray-50 rounded-lg">{event.time}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                            <p className="p-3 bg-gray-50 rounded-lg">{event.location}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* No Permissions Message - Removed, now shown in Overview */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoordinatorDashboard;
