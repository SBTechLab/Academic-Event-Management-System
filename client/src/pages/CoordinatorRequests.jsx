import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CoordinatorRequests = () => {
    const { getAuthHeaders } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/coordinator-requests/pending', {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setRequests(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:5001/api/coordinator-requests/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status })
            });
            if (response.ok) {
                setRequests(requests.filter(r => r.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-primary mb-6">Coordinator Requests</h1>

            {requests.length === 0 ? (
                <p className="text-center text-text/60">No pending requests</p>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req.id} className="bg-surface p-6 rounded-lg shadow-md border border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-text">{req.student?.full_name}</h3>
                                <p className="text-text/60 text-sm">{req.student?.email}</p>
                                <p className="text-text/60 text-sm mt-1">
                                    Requested: {new Date(req.requested_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleReview(req.id, 'approved')}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReview(req.id, 'rejected')}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CoordinatorRequests;
