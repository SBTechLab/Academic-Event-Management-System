import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const { user, getAuthHeaders } = useAuth();
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [coordinatorRequest, setCoordinatorRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [eventsRes, registrationsRes, requestRes] = await Promise.all([
                fetch('http://localhost:5001/api/events', {
                    headers: getAuthHeaders()
                }),
                fetch('http://localhost:5001/api/registrations/my-registrations', {
                    headers: getAuthHeaders()
                }),
                fetch('http://localhost:5001/api/coordinator-requests/my-request', {
                    headers: getAuthHeaders()
                })
            ]);

            if (eventsRes.ok) {
                const eventsData = await eventsRes.json();
                setEvents(eventsData.filter(e => e.status === 'approved').slice(0, 6));
            }

            if (registrationsRes.ok) {
                const regData = await registrationsRes.json();
                setRegistrations(regData);
            }

            if (requestRes.ok) {
                const reqData = await requestRes.json();
                setCoordinatorRequest(reqData);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCoordinatorRequest = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/coordinator-requests', {
                method: 'POST',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setCoordinatorRequest(data);
            }
        } catch (error) {
            console.error('Error submitting request:', error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Student Dashboard</h1>
                <p className="text-text/70">Welcome, {user?.full_name}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-text/70">Available Events</h3>
                    <p className="text-2xl font-bold text-primary">{events.length}</p>
                </div>
                <div className="bg-card p-6 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-text/70">My Registrations</h3>
                    <p className="text-2xl font-bold text-green-600">{registrations.length}</p>
                </div>
                <div className="bg-card p-6 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-text/70">Attended Events</h3>
                    <p className="text-2xl font-bold text-blue-600">
                        {registrations.filter(r => r.status === 'attended').length}
                    </p>
                </div>
            </div>

            {/* Coordinator Request Section */}
            <div className="bg-card p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-primary mb-4">Become a Coordinator</h2>
                {!coordinatorRequest ? (
                    <div>
                        <p className="text-text/70 mb-4">
                            Apply to become a Student Coordinator and help manage events in your department.
                        </p>
                        <button
                            onClick={handleCoordinatorRequest}
                            className="bg-secondary text-white px-6 py-2 rounded hover:bg-opacity-90"
                        >
                            Apply as Coordinator
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text">Your coordinator request is <strong>{coordinatorRequest.status}</strong></p>
                            <p className="text-sm text-text/60">
                                Submitted on {new Date(coordinatorRequest.requested_at).toLocaleDateString()}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded text-sm font-medium ${
                            coordinatorRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            coordinatorRequest.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                            {coordinatorRequest.status.toUpperCase()}
                        </span>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-card p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-primary mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        to="/events"
                        className="bg-primary text-white p-4 rounded-lg text-center hover:bg-opacity-90"
                    >
                        Browse Events
                    </Link>
                    <Link
                        to="/coordinator-request"
                        className="bg-secondary text-white p-4 rounded-lg text-center hover:bg-opacity-90"
                    >
                        View Coordinator Status
                    </Link>
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-card p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-primary mb-4">Upcoming Events</h2>
                {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {events.map((event) => (
                            <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">{event.date} at {event.time}</span>
                                    <span className="text-gray-500">{event.location}</span>
                                </div>
                                <Link
                                    to={`/events/${event.id}`}
                                    className="inline-block mt-3 bg-primary text-white px-4 py-2 rounded text-sm hover:bg-opacity-90"
                                >
                                    View Details
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No upcoming events available</p>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;