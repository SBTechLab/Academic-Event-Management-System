import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { fetchWithCache } from '../cacheUtils';

const FacultyDashboard = () => {
    const { user, getAuthHeaders } = useAuth();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [displayCount, setDisplayCount] = useState(10);

    const isEventCompleted = (eventDate, eventTime) => {
        const now = new Date();
        const eventDateTime = new Date(`${eventDate}T${eventTime}`);
        return eventDateTime < now;
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const headers = getAuthHeaders();
            const eventsData = await fetchWithCache('http://localhost:5001/api/events?limit=50');
            const facultyEvents = eventsData.filter(e => e.created_by === user.id);
            setMyEvents(facultyEvents);
            
            if (facultyEvents.length > 0) {
                const requestsPromises = facultyEvents.map(e => 
                    fetch(`http://localhost:5001/api/registrations/event/${e.id}`, { headers })
                        .then(r => r.ok ? r.json() : [])
                        .catch(() => [])
                );
                const allRegs = (await Promise.all(requestsPromises)).flat();
                setPendingRequests(allRegs.filter(r => r.role_type === 'coordinator' && r.status === 'pending'));
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleRequestAction = async (requestId, status, permissions = []) => {
        try {
            const body = { status };
            if (status === 'rejected' && rejectionReason) {
                body.rejection_reason = rejectionReason;
            }
            if (status === 'registered' && permissions.length > 0) {
                body.coordinator_permissions = permissions;
            }
            
            const response = await fetch(
                `http://localhost:5001/api/registrations/${requestId}/status`,
                {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(body)
                }
            );

            if (response.ok) {
                setShowRejectModal(false);
                setShowDetailsModal(false);
                setRejectionReason('');
                setSelectedRequest(null);
                setSelectedPermissions([]);
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const togglePermission = (permission) => {
        setSelectedPermissions(prev => 
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    if (loading)
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg">Loading...</p>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-6">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* HEADER */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Faculty Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Welcome back, <span className="font-medium">{user?.full_name}</span>
                    </p>
                </div>

                {/* PENDING REQUESTS ALERT */}
                {pendingRequests.length > 0 && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">⚠️ {pendingRequests.length} Pending Coordinator Request{pendingRequests.length > 1 ? 's' : ''}</h2>
                                <p className="text-orange-100 mt-1">Students waiting for approval</p>
                            </div>
                            <a href="#pending-requests" className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition">
                                Review Now
                            </a>
                        </div>
                    </div>
                )}

                {/* STATS SECTION */}
                <div className="grid gap-6 md:grid-cols-3">

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-500 font-medium uppercase">
                            My Events
                        </p>
                        <p className="text-4xl font-bold text-gray-900 mt-3">
                            {myEvents.length}
                        </p>
                        <Link
                            to="/events"
                            className="text-blue-600 text-sm mt-4 inline-block hover:underline"
                        >
                            View all events →
                        </Link>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-500 font-medium uppercase">
                            Pending Requests
                        </p>
                        <p className="text-4xl font-bold text-gray-900 mt-3">
                            {pendingRequests.length}
                        </p>
                        <p className="text-sm text-gray-500 mt-4">
                            Awaiting approval
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium uppercase">
                                Quick Action
                            </p>
                        </div>
                        <Link
                            to="/create-event"
                            className="mt-6 text-center bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Create New Event
                        </Link>
                    </div>
                </div>

                {/* REQUESTS SECTION */}
                {pendingRequests.length > 0 && (
                    <div id="pending-requests" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Pending Coordinator Requests
                        </h2>

                        <div className="space-y-5">
                            {pendingRequests.map(request => (
                                <div
                                    key={request.id}
                                    className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition"
                                >
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                                        
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {request.user?.full_name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {request.user?.email}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Event: <span className="font-medium">{request.event?.title}</span>
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setSelectedPermissions([]);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                            >
                                                See Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* RECENT EVENTS */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            My Recent Events
                        </h2>
                        <div className="text-sm text-gray-600">
                            Showing {Math.min(displayCount, myEvents.length)} of {myEvents.length} events
                        </div>
                    </div>

                    {myEvents.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">
                            You haven't created any events yet.
                        </p>
                    ) : (
                        <>
                        <div className="divide-y divide-gray-200">
                            {myEvents.slice(0, displayCount).map(event => {
                                const isCompleted = isEventCompleted(event.date, event.time);
                                return (
                                <div
                                    key={event.id}
                                    className="py-4 flex justify-between items-center"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h4 className="font-medium text-gray-900">
                                                {event.title}
                                            </h4>
                                            {event.status === 'approved' && (
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    isCompleted ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {isCompleted ? '✓ Completed' : '📅 Upcoming'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {event.date} • {event.time}
                                        </p>
                                        {event.rejection_reason && (
                                            <p className="text-xs text-red-600 mt-1">
                                                ✗ Rejection: {event.rejection_reason}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                                event.status === 'approved'
                                                    ? 'bg-green-100 text-green-700'
                                                    : event.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {event.status === 'approved' ? '✓ Approved' :
                                             event.status === 'pending' ? '⏳ Pending' : '✗ Rejected'}
                                        </span>
                                        <Link
                                            to={`/events/${event.id}/edit`}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            );})}
                        </div>
                        {myEvents.length > displayCount && (
                            <div className="flex justify-center mt-6 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setDisplayCount(prev => prev + 10)}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-md"
                                >
                                    Load More Events ({myEvents.length - displayCount} remaining)
                                </button>
                            </div>
                        )}
                        </>
                    )}
                </div>

            </div>
            
            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Reject Coordinator Request</h3>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                    setSelectedRequest(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <p className="text-gray-600 mb-4">Please provide a reason for rejecting this coordinator request:</p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            rows="4"
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                    setSelectedRequest(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRequestAction(selectedRequest.id, 'rejected')}
                                disabled={!rejectionReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                            >
                                Reject Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Coordinator Details & Permissions Modal */}
            {showDetailsModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-fadeIn max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Coordinator Request Details</h3>
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedRequest(null);
                                    setSelectedPermissions([]);
                                }}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Student Details */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-blue-900 mb-3">Student Information</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Name:</span>
                                    <span className="font-medium text-gray-900">{selectedRequest.user?.full_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="font-medium text-gray-900">{selectedRequest.user?.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Event:</span>
                                    <span className="font-medium text-gray-900">{selectedRequest.event?.title}</span>
                                </div>
                            </div>
                        </div>

                        {/* Permissions Selection */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Grant Coordinator Permissions</h4>
                            <p className="text-sm text-gray-600 mb-4">Select the permissions you want to grant to this coordinator:</p>
                            
                            <div className="space-y-3">
                                <label className="flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes('mark_attendance')}
                                        onChange={() => togglePermission('mark_attendance')}
                                        className="mt-1 mr-3"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">✅ Mark Attendance</div>
                                        <div className="text-sm text-gray-600">Allow coordinator to mark participant attendance</div>
                                    </div>
                                </label>

                                <label className="flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes('view_participants')}
                                        onChange={() => togglePermission('view_participants')}
                                        className="mt-1 mr-3"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">👥 View Participants</div>
                                        <div className="text-sm text-gray-600">View list of all registered participants</div>
                                    </div>
                                </label>

                                <label className="flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes('manage_event_details')}
                                        onChange={() => togglePermission('manage_event_details')}
                                        className="mt-1 mr-3"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">✏️ Manage Event Details</div>
                                        <div className="text-sm text-gray-600">Edit event information and details</div>
                                    </div>
                                </label>

                                <label className="flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes('send_announcements')}
                                        onChange={() => togglePermission('send_announcements')}
                                        className="mt-1 mr-3"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">📢 Send Announcements</div>
                                        <div className="text-sm text-gray-600">Send notifications to participants</div>
                                    </div>
                                </label>

                                <label className="flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes('generate_reports')}
                                        onChange={() => togglePermission('generate_reports')}
                                        className="mt-1 mr-3"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">📊 Generate Reports</div>
                                        <div className="text-sm text-gray-600">Generate attendance and participation reports</div>
                                    </div>
                                </label>

                                <label className="flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes('manage_registrations')}
                                        onChange={() => togglePermission('manage_registrations')}
                                        className="mt-1 mr-3"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">📋 Manage Registrations</div>
                                        <div className="text-sm text-gray-600">Approve or cancel participant registrations</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedRequest(null);
                                    setSelectedPermissions([]);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedRequest(selectedRequest);
                                    setShowRejectModal(true);
                                    setShowDetailsModal(false);
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleRequestAction(selectedRequest.id, 'registered', selectedPermissions)}
                                disabled={selectedPermissions.length === 0}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Approve with Permissions
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyDashboard;