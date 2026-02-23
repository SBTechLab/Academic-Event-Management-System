import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CoordinatorReview = () => {
    const { id } = useParams(); // registration id
    const { getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [permissions, setPermissions] = useState({
        generate_certificates: false,
        view_participants: false,
        update_schedule: false,
        add_details: false
    });

    useEffect(() => {
        fetchRegistration();
    }, [id]);

    const fetchRegistration = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/registrations/${id}`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setRegistration(data);
            }
        } catch (err) {
            console.error('Error fetching registration:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = (permission) => {
        setPermissions(prev => ({
            ...prev,
            [permission]: !prev[permission]
        }));
    };

    const handleApprove = async () => {
        setSubmitting(true);
        try {
            const selectedPermissions = Object.keys(permissions).filter(key => permissions[key]);
            const response = await fetch(`http://localhost:5001/api/registrations/${id}/approve-coordinator`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ permissions: selectedPermissions })
            });
            if (response.ok) {
                alert('Coordinator approved successfully!');
                navigate('/faculty-dashboard');
            }
        } catch (err) {
            alert('Failed to approve coordinator');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!confirm('Are you sure you want to reject this coordinator application?')) return;
        setSubmitting(true);
        try {
            const response = await fetch(`http://localhost:5001/api/registrations/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                alert('Coordinator application rejected');
                navigate('/faculty-dashboard');
            }
        } catch (err) {
            alert('Failed to reject application');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (!registration) return <div className="text-center py-10 text-red-600">Application not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:text-blue-800 font-medium">
                    ← Back
                </button>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Coordinator Application Review</h1>

                    {/* Student Details */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-blue-800 mb-4">👤 Student Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="font-medium text-gray-700">Name:</span>
                                <span className="ml-2 text-gray-900">{registration.user?.full_name || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Email:</span>
                                <span className="ml-2 text-gray-900">{registration.user?.email || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Role:</span>
                                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                                    {registration.role_type || 'participant'}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Applied On:</span>
                                <span className="ml-2 text-gray-900">
                                    {new Date(registration.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-green-800 mb-4">📅 Event Details</h2>
                        <div className="space-y-2">
                            <div>
                                <span className="font-medium text-gray-700">Event:</span>
                                <span className="ml-2 text-gray-900 text-lg">{registration.event?.title || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Date:</span>
                                <span className="ml-2 text-gray-900">{registration.event?.date || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Time:</span>
                                <span className="ml-2 text-gray-900">{registration.event?.time || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Location:</span>
                                <span className="ml-2 text-gray-900">{registration.event?.location || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-purple-800 mb-4">🔐 Grant Permissions</h2>
                        <p className="text-gray-600 mb-4 text-sm">Select the permissions you want to grant to this coordinator:</p>
                        
                        <div className="space-y-3">
                            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                                <input
                                    type="checkbox"
                                    checked={permissions.generate_certificates}
                                    onChange={() => handlePermissionChange('generate_certificates')}
                                    className="mt-1 mr-3 w-5 h-5"
                                />
                                <div>
                                    <div className="font-semibold text-gray-900">📜 Generate Certificates</div>
                                    <div className="text-sm text-gray-600">Allow coordinator to generate and issue certificates</div>
                                </div>
                            </label>

                            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                                <input
                                    type="checkbox"
                                    checked={permissions.view_participants}
                                    onChange={() => handlePermissionChange('view_participants')}
                                    className="mt-1 mr-3 w-5 h-5"
                                />
                                <div>
                                    <div className="font-semibold text-gray-900">👥 View Participant List</div>
                                    <div className="text-sm text-gray-600">Allow coordinator to view all registered participants</div>
                                </div>
                            </label>

                            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                                <input
                                    type="checkbox"
                                    checked={permissions.update_schedule}
                                    onChange={() => handlePermissionChange('update_schedule')}
                                    className="mt-1 mr-3 w-5 h-5"
                                />
                                <div>
                                    <div className="font-semibold text-gray-900">📅 Update Schedule</div>
                                    <div className="text-sm text-gray-600">Allow coordinator to update event schedule and timing</div>
                                </div>
                            </label>

                            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                                <input
                                    type="checkbox"
                                    checked={permissions.add_details}
                                    onChange={() => handlePermissionChange('add_details')}
                                    className="mt-1 mr-3 w-5 h-5"
                                />
                                <div>
                                    <div className="font-semibold text-gray-900">✏️ Add Event Details</div>
                                    <div className="text-sm text-gray-600">Allow coordinator to add additional event information</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 justify-end">
                        <button
                            onClick={handleReject}
                            disabled={submitting}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                        >
                            ✗ Reject Application
                        </button>
                        <button
                            onClick={handleApprove}
                            disabled={submitting}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                        >
                            ✓ Approve as Coordinator
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoordinatorReview;
