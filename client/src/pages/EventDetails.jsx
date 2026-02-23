import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EventDetails = () => {
    const { id } = useParams();
    const { user, getAuthHeaders, role } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [registrations, setRegistrations] = useState([]);
    const [isRegistered, setIsRegistered] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState('participant');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/events/${id}`);
            if (!response.ok) throw new Error('Event not found');
            const data = await response.json();
            setEvent(data);
            
            // Check if student is already registered
            if (role === 'student' || role === 'student_coordinator') {
                const checkRes = await fetch(`http://localhost:5001/api/registrations/check/${id}`, {
                    headers: getAuthHeaders()
                });
                if (checkRes.ok) {
                    const checkData = await checkRes.json();
                    setIsRegistered(checkData.registered);
                    if (checkData.registration) {
                        setSelectedRole(checkData.registration.role_type || 'participant');
                    }
                }
            }
            
            // If admin or faculty, also fetch registrations
            if (role === 'admin' || role === 'faculty') {
                const regResponse = await fetch(`http://localhost:5001/api/registrations/event/${id}`, {
                    headers: getAuthHeaders()
                });
                if (regResponse.ok) {
                    const regData = await regResponse.json();
                    setRegistrations(regData);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setShowRoleModal(true);
    };

    const confirmRegistration = async () => {
        setRegistering(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch('http://localhost:5001/api/registrations', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ event_id: id, role_type: selectedRole })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setMessage(`Successfully registered as ${selectedRole}!`);
            setIsRegistered(true);
            setShowRoleModal(false);
            if (selectedRole === 'coordinator') {
                setMessage('Coordinator request submitted! Waiting for faculty approval.');
            }
            fetchEvent();
        } catch (err) {
            setError(err.message);
        } finally {
            setRegistering(false);
        }
    };

    const handleApprove = async () => {
        setSubmitting(true);
        try {
            const response = await fetch(`http://localhost:5001/api/events/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: 'approved' })
            });
            if (response.ok) {
                setMessage('Event approved successfully!');
                setTimeout(() => navigate('/admin-dashboard'), 1500);
            }
        } catch (err) {
            setError('Failed to approve event');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }
        setSubmitting(true);
        try {
            const response = await fetch(`http://localhost:5001/api/events/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: 'rejected', rejection_reason: rejectionReason })
            });
            if (response.ok) {
                setMessage('Event rejected successfully!');
                setTimeout(() => navigate('/admin-dashboard'), 1500);
            }
        } catch (err) {
            setError('Failed to reject event');
        } finally {
            setSubmitting(false);
            setShowRejectModal(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading details...</div>;
    if (!event) return <div className="text-center py-10 text-red-500">Event not found</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-5xl mx-auto">
                <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:text-blue-800 font-medium">&larr; Back</button>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {event.image_url && (
                        <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-64 object-cover"
                        />
                    )}
                    <div className="p-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">{event.title}</h1>
                        <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
                            <span className="flex items-center gap-2">📅 {new Date(event.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-2">🕐 {event.time}</span>
                            <span className="flex items-center gap-2">📍 {event.location}</span>
                        </div>

                        <div className="prose max-w-none text-gray-700 mb-8">
                            <p className="whitespace-pre-line text-lg">{event.description}</p>
                        </div>

                        {/* Admin & Faculty event details */}
                        {(role === 'admin' || role === 'faculty') && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-blue-800 mb-4">📋 Event Management Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                                    <div>
                                        <span className="font-medium text-gray-700">Created by:</span>
                                        <span className="ml-2 text-gray-900">{event.creator?.full_name || 'Unknown'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Creator Email:</span>
                                        <span className="ml-2 text-gray-900">{event.creator?.email || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Status:</span>
                                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                            event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            event.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {event.status}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Total Registrations:</span>
                                        <span className="ml-2 text-gray-900 font-semibold">{registrations.length}</span>
                                    </div>
                                </div>
                                
                                {registrations.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <span>👥 Registered Participants ({registrations.filter(r => r.role_type === 'participant').length})</span>
                                        </h4>
                                        <div className="max-h-64 overflow-y-auto bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                                            {registrations.filter(r => r.role_type === 'participant').map((reg) => (
                                                <div key={reg.id} className="p-3 hover:bg-gray-50 transition">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{reg.user?.full_name || 'Unknown'}</p>
                                                            <p className="text-xs text-gray-600">{reg.user?.email || 'N/A'}</p>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            reg.status === 'attended' ? 'bg-green-100 text-green-700' :
                                                            reg.status === 'registered' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {reg.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {registrations.filter(r => r.role_type === 'coordinator').length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                    <span>⭐ Event Coordinators ({registrations.filter(r => r.role_type === 'coordinator').length})</span>
                                                </h4>
                                                <div className="bg-purple-50 rounded-lg border border-purple-200 divide-y divide-purple-100">
                                                    {registrations.filter(r => r.role_type === 'coordinator').map((reg) => (
                                                        <div key={reg.id} className="p-3">
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{reg.user?.full_name || 'Unknown'}</p>
                                                                    <p className="text-xs text-gray-600">{reg.user?.email || 'N/A'}</p>
                                                                </div>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                    reg.status === 'registered' ? 'bg-purple-100 text-purple-700' :
                                                                    reg.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                                }`}>
                                                                    {reg.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            {role === 'admin' ? (
                                <>
                                    <button
                                        onClick={() => navigate('/admin-dashboard')}
                                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    {event.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={handleApprove}
                                                disabled={submitting}
                                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                                            >
                                                ✓ Approve Event
                                            </button>
                                            <button
                                                onClick={() => setShowRejectModal(true)}
                                                disabled={submitting}
                                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                                            >
                                                ✗ Reject Event
                                            </button>
                                        </>
                                    )}
                                    {(event.status === 'approved' || event.status === 'rejected') && event.status !== 'cancelled' && (
                                        <button
                                            onClick={async () => {
                                                if (confirm('Delete this event? This will cancel it for all participants.')) {
                                                    await fetch(`http://localhost:5001/api/events/${id}`, {
                                                        method: 'PUT',
                                                        headers: getAuthHeaders(),
                                                        body: JSON.stringify({ status: 'cancelled' })
                                                    });
                                                    fetchEvent();
                                                }
                                            }}
                                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                        >
                                            Delete Event
                                        </button>
                                    )}
                                </>
                            ) : role === 'faculty' ? (
                                <button
                                    onClick={() => navigate('/faculty-dashboard')}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                >
                                    ← Back to Dashboard
                                </button>
                            ) : isRegistered ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-3">
                                    <p className="text-green-800 font-medium">
                                        {event.status === 'cancelled' ? '❌ Event Cancelled' : '✓ Registered for this Event'}
                                    </p>
                                </div>
                            ) : event.status === 'cancelled' ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg px-6 py-3">
                                    <p className="text-red-800 font-medium">
                                        ❌ Event Cancelled
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleRegister}
                                    disabled={registering}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                                >
                                    Register for Event
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Reject Event</h3>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                    setError('');
                                }}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <p className="text-gray-600 mb-4">Please provide a reason for rejecting this event:</p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            rows="4"
                        />
                        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                    setError('');
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={submitting || !rejectionReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                            >
                                {submitting ? 'Rejecting...' : 'Reject Event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Selection Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Select Your Role</h3>
                            <button
                                onClick={() => {
                                    setShowRoleModal(false);
                                    setSelectedRole('participant');
                                }}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <p className="text-gray-600 mb-4">Choose how you want to participate in this event:</p>
                        
                        <div className="space-y-3 mb-6">
                            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                                selectedRole === 'participant' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="participant"
                                    checked={selectedRole === 'participant'}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="mt-1 mr-3"
                                />
                                <div>
                                    <div className="font-semibold text-gray-900">👥 Participant</div>
                                    <div className="text-sm text-gray-600">Attend and participate in the event</div>
                                </div>
                            </label>
                            
                            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                                selectedRole === 'coordinator' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="coordinator"
                                    checked={selectedRole === 'coordinator'}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="mt-1 mr-3"
                                />
                                <div>
                                    <div className="font-semibold text-gray-900">⭐ Event Coordinator</div>
                                    <div className="text-sm text-gray-600">Help organize and manage the event</div>
                                </div>
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRoleModal(false);
                                    setSelectedRole('participant');
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRegistration}
                                disabled={registering}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                            >
                                {registering ? 'Registering...' : 'Confirm Registration'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetails;
