import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clearCache } from '../cacheUtils';

const BLUE = '#0061ff';

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
    const [registrationStatus, setRegistrationStatus] = useState('');
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState('participant');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchEvent(); }, [id]);

    // Refresh when page becomes visible (tab focus)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchEvent();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [id]);

    // Refresh every 10 seconds for real-time updates
    useEffect(() => {
        const interval = setInterval(fetchEvent, 10000);
        return () => clearInterval(interval);
    }, [id]);

    const fetchEvent = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5001/api/events/${id}`);
            if (!response.ok) throw new Error('Event not found');
            const data = await response.json();
            setEvent(data);

            if (user && (role === 'student' || role === 'student_coordinator')) {
                const checkRes = await fetch(`http://localhost:5001/api/registrations/check/${id}`, { headers: getAuthHeaders() });
                if (checkRes.ok) {
                    const checkData = await checkRes.json();
                    setIsRegistered(checkData.registered);
                    if (checkData.registration) {
                        setSelectedRole(checkData.registration.role_type || 'participant');
                        setRegistrationStatus(checkData.registration.status || '');
                    }
                }
            }

            if (role === 'admin') {
                const regRes = await fetch(`http://localhost:5001/api/registrations/event/${id}`, { headers: getAuthHeaders() });
                if (regRes.ok) setRegistrations(await regRes.json());
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const confirmRegistration = async () => {
        setRegistering(true);
        setMessage(''); setError('');
        try {
            const res = await fetch('http://localhost:5001/api/registrations', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ event_id: id, role_type: selectedRole })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            setIsRegistered(true);
            setRegistrationStatus(selectedRole === 'coordinator' ? 'pending' : 'registered');
            setShowRoleModal(false);
            setMessage(selectedRole === 'coordinator'
                ? 'Coordinator request submitted! Waiting for faculty approval.'
                : 'Successfully registered for this event!');
        } catch (err) {
            setError(err.message);
            setShowRoleModal(false);
        } finally {
            setRegistering(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteReason.trim()) { setError('Please provide a reason for deletion'); return; }
        setSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5001/api/events/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
                body: JSON.stringify({ reason: deleteReason })
            });
            if (res.ok) { 
                clearCache(); // Clear all cache after deletion
                setMessage('Event deleted. Faculty has been notified.'); 
                setTimeout(() => navigate('/admin-dashboard'), 1500); 
            }
            else { const d = await res.json(); setError(d.error || 'Failed to delete'); }
        } catch { setError('Failed to delete event'); }
        finally { setSubmitting(false); setShowDeleteModal(false); }
    };

    const handleApprove = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5001/api/events/${id}`, {
                method: 'PUT', headers: getAuthHeaders(),
                body: JSON.stringify({ status: 'approved' })
            });
            if (res.ok) { 
                clearCache(); // Clear cache after approval
                setMessage('Event approved successfully!'); 
                setTimeout(() => navigate('/admin-dashboard'), 1500); 
            }
        } catch { setError('Failed to approve event'); }
        finally { setSubmitting(false); }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) { setError('Please provide a reason for rejection'); return; }
        setSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5001/api/events/${id}`, {
                method: 'PUT', headers: getAuthHeaders(),
                body: JSON.stringify({ status: 'rejected', rejection_reason: rejectionReason })
            });
            if (res.ok) { 
                clearCache(); // Clear cache after rejection
                setMessage('Event rejected.'); 
                setTimeout(() => navigate('/admin-dashboard'), 1500); 
            }
        } catch { setError('Failed to reject event'); }
        finally { setSubmitting(false); setShowRejectModal(false); }
    };

    if (loading) return <div className="text-center py-16 text-gray-500 text-lg">Loading details...</div>;
    if (!event) return <div className="text-center py-16 text-red-500 text-lg">Event not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)}
                className="mb-5 flex items-center gap-2 font-semibold text-base transition-opacity hover:opacity-70"
                style={{ color: BLUE }}>
                ← Back
            </button>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {event.image_url && (
                    <img src={event.image_url} alt={event.title} className="w-full h-72 object-cover" />
                )}
                <div style={{ height: '4px', background: BLUE }} />

                <div className="p-8">
                    {/* Title + Status */}
                    <div className="flex items-start justify-between mb-5 gap-4">
                        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{event.title}</h1>
                        <span className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold ${
                            event.status === 'approved' ? 'bg-green-100 text-green-700' :
                            event.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-4 mb-7">
                        {[
                            { icon: 'Date', text: new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                            { icon: 'Time', text: event.time },
                            { icon: 'Location', text: event.location },
                            event.event_type && { icon: 'Type', text: event.event_type },
                        ].filter(Boolean).map((item, i) => (
                            <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                                <span className="text-sm font-semibold text-gray-500 uppercase">{item.icon}:</span>
                                <span className="text-gray-700 font-medium text-base">{item.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <div className="mb-8 p-5 bg-gray-50 rounded-xl border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-700 mb-3">About this Event</h2>
                        <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">{event.description}</p>
                    </div>

                    {/* Admin Panel */}
                    {role === 'admin' && (
                        <div className="rounded-xl p-6 mb-6 border" style={{ background: '#eff6ff', borderColor: BLUE }}>
                            <h3 className="text-lg font-bold mb-4" style={{ color: '#003fa3' }}>Event Management Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base mb-4">
                                <div><span className="font-semibold text-gray-600">Created by:</span> <span className="text-gray-900 font-bold ml-1">{event.creator?.full_name || 'Unknown'}</span></div>
                                <div><span className="font-semibold text-gray-600">Email:</span> <span className="text-gray-800 ml-1">{event.creator?.email || 'N/A'}</span></div>
                                <div><span className="font-semibold text-gray-600">Registrations:</span> <span className="text-gray-800 ml-1">{registrations.length} participants</span></div>
                                {event.update_reason && (
                                    <div className="col-span-2"><span className="font-semibold text-gray-600">Update Reason:</span> <span className="text-blue-800 ml-1">{event.update_reason}</span></div>
                                )}
                            </div>
                            {registrations.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2 text-base">Registered Participants:</h4>
                                    <div className="max-h-44 overflow-y-auto bg-white rounded-lg border p-3 space-y-1.5">
                                        {registrations.map((reg, i) => (
                                            <div key={i} className="text-sm text-gray-600 flex justify-between items-center">
                                                <span>• {reg.user?.full_name || 'Unknown'} ({reg.user?.email || 'N/A'})</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${reg.role_type === 'coordinator' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {reg.role_type || 'participant'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {message && <div className="bg-green-50 border border-green-300 text-green-800 px-5 py-4 rounded-xl mb-5 text-base font-medium">{message}</div>}
                    {error   && <div className="bg-red-50 border border-red-300 text-red-700 px-5 py-4 rounded-xl mb-5 text-base font-medium">{error}</div>}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 flex-wrap">
                        {role === 'admin' ? (
                            <>
                                <button onClick={() => navigate('/admin-dashboard')}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition font-semibold text-base">
                                    ← Back to Dashboard
                                </button>
                                {event.status === 'pending' && (
                                    <>
                                        <button onClick={handleApprove} disabled={submitting}
                                            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold text-base disabled:opacity-50">
                                            Approve Event
                                        </button>
                                        <button onClick={() => setShowRejectModal(true)} disabled={submitting}
                                            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold text-base disabled:opacity-50">
                                            Reject Event
                                        </button>
                                    </>
                                )}
                                <button onClick={() => setShowDeleteModal(true)} disabled={submitting}
                                    className="px-6 py-3 bg-red-700 text-white rounded-xl hover:bg-red-800 transition font-semibold text-base disabled:opacity-50">
                                    Delete Event
                                </button>
                            </>
                        ) : role === 'faculty' ? (
                            <button onClick={() => navigate('/faculty-dashboard')}
                                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition font-semibold text-base">
                                ← Back to Dashboard
                            </button>
                        ) : (role === 'student' || role === 'student_coordinator') ? (
                            isRegistered ? (
                                <div className="rounded-xl px-6 py-4 border" style={{
                                    background: selectedRole === 'coordinator' && registrationStatus === 'pending' ? '#fff7ed' : '#eff6ff',
                                    borderColor: selectedRole === 'coordinator' && registrationStatus === 'pending' ? '#f97316' : BLUE
                                }}>
                                    <p className="font-bold text-base" style={{
                                        color: selectedRole === 'coordinator' && registrationStatus === 'pending' ? '#c2410c' : '#003fa3'
                                    }}>
                                        {selectedRole === 'coordinator'
                                            ? registrationStatus === 'pending'
                                                ? 'Coordinator request submitted'
                                                : 'Approved as Coordinator'
                                            : 'Already Registered for this Event'
                                        }
                                    </p>
                                    {selectedRole === 'coordinator' && registrationStatus === 'pending' && (
                                        <p className="text-sm font-semibold mt-1 text-orange-500">Waiting for faculty approval</p>
                                    )}
                                </div>
                            ) : (
                                <button onClick={() => setShowRoleModal(true)} disabled={registering}
                                    className="px-8 py-3 text-white rounded-xl transition font-bold text-base disabled:opacity-50 hover:opacity-90"
                                    style={{ background: BLUE }}>
                                    Register for Event
                                </button>
                            )
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-7">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-xl font-extrabold text-red-700">Delete Event</h3>
                            <button onClick={() => { setShowDeleteModal(false); setDeleteReason(''); setError(''); }}
                                className="text-gray-400 hover:text-gray-600 text-3xl leading-none">×</button>
                        </div>
                        <p className="text-gray-600 mb-1 text-base">You are about to permanently delete:</p>
                        <p className="font-bold text-gray-900 mb-4 text-base">"{event.title}"</p>
                        <p className="text-gray-500 mb-3 text-sm">Provide a reason — the faculty will be notified.</p>
                        <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)}
                            placeholder="Enter reason for deletion..."
                            className="w-full border border-gray-300 rounded-xl p-4 text-base focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                            rows="4" />
                        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => { setShowDeleteModal(false); setDeleteReason(''); setError(''); }}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold text-base">
                                Cancel
                            </button>
                            <button onClick={handleDelete} disabled={submitting || !deleteReason.trim()}
                                className="flex-1 px-4 py-3 bg-red-700 text-white rounded-xl hover:bg-red-800 font-semibold text-base disabled:opacity-50">
                                {submitting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-7">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-xl font-extrabold text-gray-900">Reject Event</h3>
                            <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); setError(''); }}
                                className="text-gray-400 hover:text-gray-600 text-3xl leading-none">×</button>
                        </div>
                        <p className="text-gray-600 mb-4 text-base">Please provide a reason for rejecting this event:</p>
                        <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full border border-gray-300 rounded-xl p-4 text-base focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                            rows="4" />
                        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); setError(''); }}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold text-base">
                                Cancel
                            </button>
                            <button onClick={handleReject} disabled={submitting || !rejectionReason.trim()}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold text-base disabled:opacity-50">
                                {submitting ? 'Rejecting...' : 'Reject Event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Selection Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-7">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-xl font-extrabold text-gray-900">Select Your Role</h3>
                            <button onClick={() => { setShowRoleModal(false); setSelectedRole('participant'); }}
                                className="text-gray-400 hover:text-gray-600 text-3xl leading-none">×</button>
                        </div>
                        <p className="text-gray-600 mb-5 text-base">Choose how you want to participate:</p>
                        <div className="space-y-3 mb-6">
                            <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition ${
                                selectedRole === 'participant' ? 'bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`} style={selectedRole === 'participant' ? { borderColor: BLUE } : {}}>
                                <input type="radio" name="role" value="participant"
                                    checked={selectedRole === 'participant'}
                                    onChange={e => setSelectedRole(e.target.value)}
                                    className="mt-1 mr-3" />
                                <div>
                                    <div className="font-bold text-gray-900 text-base">Participant</div>
                                    <div className="text-gray-500 text-sm mt-0.5">Attend and participate in the event</div>
                                </div>
                            </label>
                            <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition ${
                                selectedRole === 'coordinator' ? 'bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`} style={selectedRole === 'coordinator' ? { borderColor: BLUE } : {}}>
                                <input type="radio" name="role" value="coordinator"
                                    checked={selectedRole === 'coordinator'}
                                    onChange={e => setSelectedRole(e.target.value)}
                                    className="mt-1 mr-3" />
                                <div>
                                    <div className="font-bold text-gray-900 text-base">Event Coordinator</div>
                                    <div className="text-gray-500 text-sm mt-0.5">Help organize and manage the event (requires faculty approval)</div>
                                </div>
                            </label>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setShowRoleModal(false); setSelectedRole('participant'); }}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold text-base">
                                Cancel
                            </button>
                            <button onClick={confirmRegistration} disabled={registering}
                                className="flex-1 px-4 py-3 text-white rounded-xl font-bold text-base disabled:opacity-50 hover:opacity-90 transition"
                                style={{ background: BLUE }}>
                                {registering ? 'Registering...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetails;
