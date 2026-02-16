import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const FacultyDashboard = () => {
    const { user, role, getAuthHeaders } = useAuth();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const headers = getAuthHeaders();
            
            // Fetch coordinator requests
            const reqRes = await fetch('http://localhost:5001/api/coordinator-requests/pending', {
                headers
            });
            if (reqRes.ok) {
                const data = await reqRes.json();
                setPendingRequests(data);
            }

            // Fetch my events
            const eventsRes = await fetch('http://localhost:5001/api/events', { headers });
            if (eventsRes.ok) {
                const data = await eventsRes.json();
                setMyEvents(data.filter(e => e.created_by === user.id));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary">Faculty Dashboard</h1>
                <p className="text-text/60 mt-1">Welcome, {user?.full_name}</p>
                <p className="text-secondary font-medium">Role: Faculty</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface p-6 rounded-lg shadow-md border border-gray-100">
                    <h3 className="font-bold text-lg mb-2">My Events</h3>
                    <p className="text-4xl font-bold text-primary">{myEvents.length}</p>
                    <Link to="/events" className="text-sm text-secondary hover:underline mt-2 block">View All</Link>
                </div>

                <div className="bg-surface p-6 rounded-lg shadow-md border border-gray-100">
                    <h3 className="font-bold text-lg mb-2">Coordinator Requests</h3>
                    <p className="text-4xl font-bold text-primary">{pendingRequests.length}</p>
                    <Link to="/coordinator-requests" className="text-sm text-secondary hover:underline mt-2 block">Review Requests</Link>
                </div>

                <div className="bg-surface p-6 rounded-lg shadow-md border border-gray-100">
                    <h3 className="font-bold text-lg mb-2">Quick Actions</h3>
                    <div className="space-y-2 mt-4">
                        <Link to="/events/create" className="block text-primary hover:underline">Create Event</Link>
                        <Link to="/coordinator-requests" className="block text-primary hover:underline">Manage Coordinators</Link>
                    </div>
                </div>
            </div>

            {pendingRequests.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-6">
                    <h3 className="font-bold text-lg mb-3">⚠️ Pending Coordinator Requests</h3>
                    <p className="text-text/70 mb-3">You have {pendingRequests.length} pending coordinator request(s) to review.</p>
                    <Link to="/coordinator-requests" className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 inline-block">
                        Review Now
                    </Link>
                </div>
            )}

            <div className="bg-surface p-6 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-xl font-bold text-primary mb-4">Recent Events</h2>
                {myEvents.length === 0 ? (
                    <p className="text-text/60">No events created yet.</p>
                ) : (
                    <div className="space-y-3">
                        {myEvents.slice(0, 5).map(event => (
                            <div key={event.id} className="border-b pb-3 last:border-0">
                                <h4 className="font-bold">{event.title}</h4>
                                <p className="text-sm text-text/60">{new Date(event.date).toLocaleDateString()} - {event.status}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyDashboard;
