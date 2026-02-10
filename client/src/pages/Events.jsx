import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/events');
                if (!response.ok) throw new Error('Failed to fetch events');
                const data = await response.json();
                setEvents(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) return <div className="text-center py-10">Loading events...</div>;
    if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-primary mb-8">Upcoming Events</h1>

            {events.length === 0 ? (
                <p className="text-center text-text/60">No upcoming events found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <div key={event.id} className="bg-surface rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                            {event.image_url && (
                                <img
                                    src={event.image_url}
                                    alt={event.title}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-text mb-2">{event.title}</h3>
                                <p className="text-secondary font-medium mb-4">
                                    {new Date(event.date).toLocaleDateString()} at {event.time}
                                </p>
                                <p className="text-text/70 mb-4 line-clamp-3">
                                    {event.description}
                                </p>
                                <Link
                                    to={`/events/${event.id}`}
                                    className="block text-center bg-primary text-white py-2 rounded hover:bg-opacity-90 transition-colors"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Events;
