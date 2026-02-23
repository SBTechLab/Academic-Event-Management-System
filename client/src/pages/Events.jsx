import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Events = () => {
    const { role } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [displayCount, setDisplayCount] = useState(10);

    const isEventCompleted = (eventDate, eventTime) => {
        const now = new Date();
        const eventDateTime = new Date(`${eventDate}T${eventTime}`);
        return eventDateTime < now;
    };

    const getEventStatus = (event) => {
        if (event.status === 'cancelled') {
            return 'cancelled';
        }
        if (event.status === 'approved' && isEventCompleted(event.date, event.time)) {
            return 'completed';
        }
        return event.status;
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/events');
                if (!response.ok) throw new Error('Failed to fetch events');
                const data = await response.json();

                const filteredEvents =
                    role === 'student' || role === 'student_coordinator'
                        ? data.filter(e => e.status === 'approved' || e.status === 'cancelled')
                        : data;

                setEvents(filteredEvents);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [role]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-gray-600 text-lg">Loading events...</div></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="bg-white shadow rounded-xl px-8 py-6 text-red-600">Error: {error}</div></div>;

    return (
        <div className="min-h-screen bg-gray-50 py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-10">Upcoming Events</h1>

                {events.length === 0 ? (
                    <div className="bg-white rounded-xl border p-12 text-center shadow-sm">
                        <p className="text-gray-600 text-lg">No upcoming events found.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {events.slice(0, displayCount).map(event => {
                            const displayStatus = getEventStatus(event);
                            return (
                                <div key={event.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition duration-300">
                                    {event.image_url && (
                                        <img src={event.image_url} alt={event.title} className="w-full h-52 object-cover rounded-t-xl" />
                                    )}

                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                displayStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                displayStatus === 'completed' ? 'bg-gray-100 text-gray-700' :
                                                displayStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                                displayStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {displayStatus}
                                            </span>
                                        </div>

                                        <div className="space-y-1 text-sm text-gray-600 mb-4">
                                            <div>📅 {new Date(event.date).toLocaleDateString()}</div>
                                            <div>🕐 {event.time}</div>
                                            <div>📍 {event.location}</div>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                                        <Link
                                            to={`/events/${event.id}`}
                                            className={`block text-center py-2.5 rounded-lg transition font-medium ${
                                                displayStatus === 'cancelled' 
                                                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                            onClick={(e) => displayStatus === 'cancelled' && e.preventDefault()}
                                        >
                                            {displayStatus === 'cancelled' ? 'Event Cancelled' : 'View Details'}
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                        {events.length > displayCount && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={() => setDisplayCount(prev => prev + 10)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    Show More ({events.length - displayCount} remaining)
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Events;
