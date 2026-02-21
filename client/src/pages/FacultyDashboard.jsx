import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const FacultyDashboard = () => {
    const { user, getAuthHeaders } = useAuth();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const headers = getAuthHeaders();

            const eventsRes = await fetch('http://localhost:5001/api/events', { headers });

            if (eventsRes.ok) {
                const data = await eventsRes.json();
                const facultyEvents = data.filter(e => e.created_by === user.id);
                setMyEvents(facultyEvents);
                
                // Fetch coordinator requests for each faculty event
                const allRequests = [];
                for (const event of facultyEvents) {
                    const reqRes = await fetch(`http://localhost:5001/api/registrations/event/${event.id}`, { headers });
                    if (reqRes.ok) {
                        const regs = await reqRes.json();
                        const coordRequests = regs.filter(r => 
                            r.role_type === 'coordinator' && 
                            r.status === 'pending'
                        );
                        allRequests.push(...coordRequests);
                    }
                }
                setPendingRequests(allRequests);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestAction = async (requestId, status) => {
        try {
            const body = { status };
            if (status === 'rejected' && rejectionReason) {
                body.rejection_reason = rejectionReason;
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
                setRejectionReason('');
                setSelectedRequest(null);
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-600 text-lg">Loading dashboard...</p>
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
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
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
                                                onClick={() =>
                                                    handleRequestAction(request.id, 'registered')
                                                }
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setShowRejectModal(true);
                                                }}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                                            >
                                                Reject
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
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        My Recent Events
                    </h2>

                    {myEvents.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">
                            You haven't created any events yet.
                        </p>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {myEvents.slice(0, 5).map(event => (
                                <div
                                    key={event.id}
                                    className="py-4 flex justify-between items-center"
                                >
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            {event.title}
                                        </h4>
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
                            ))}
                        </div>
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
        </div>
    );
};

export default FacultyDashboard;