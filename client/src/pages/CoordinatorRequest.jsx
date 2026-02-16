import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CoordinatorRequest = () => {
    const { getAuthHeaders } = useAuth();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchMyRequest();
    }, []);

    const fetchMyRequest = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/coordinator-requests/my-request', {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setRequest(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setMessage('');
        try {
            const response = await fetch('http://localhost:5001/api/coordinator-requests', {
                method: 'POST',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok) {
                setRequest(data);
                setMessage('Request submitted successfully!');
            } else {
                setMessage(data.error);
            }
        } catch (err) {
            setMessage('Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-primary mb-6">Become a Coordinator</h1>

            {message && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                    {message}
                </div>
            )}

            {!request ? (
                <div className="bg-surface p-8 rounded-lg shadow-md border border-gray-100">
                    <p className="text-text mb-6">
                        Apply to become a Student Coordinator and help manage events in your department.
                    </p>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-primary text-white px-6 py-3 rounded hover:bg-opacity-90 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            ) : (
                <div className="bg-surface p-8 rounded-lg shadow-md border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Request Status</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-text">Status:</span>
                        <span className={`px-3 py-1 rounded font-medium ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                            {request.status.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-text/60 mt-4">
                        Requested on: {new Date(request.requested_at).toLocaleDateString()}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CoordinatorRequest;
