import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EventDetails = () => {
    const { id } = useParams();
    const { user, getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/events/${id}`);
                if (!response.ok) throw new Error('Event not found');
                const data = await response.json();
                setEvent(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    const handleRegister = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setRegistering(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/registrations', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ event_id: id })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setMessage('Successfully registered!');
        } catch (err) {
            setError(err.message);
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading details...</div>;
    if (!event) return <div className="text-center py-10 text-red-500">Event not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)} className="mb-4 text-primary hover:underline">&larr; Back</button>

            <div className="bg-surface rounded-lg shadow-md overflow-hidden border border-gray-100">
                {event.image_url && (
                    <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-64 object-cover"
                    />
                )}
                <div className="p-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">{event.title}</h1>
                    <div className="flex flex-col md:flex-row md:items-center text-secondary mb-6 space-y-2 md:space-y-0 md:space-x-6">
                        <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                        <span>⏰ {event.time}</span>
                        <span>📍 {event.location}</span>
                    </div>

                    <div className="prose max-w-none text-text mb-8">
                        <p className="whitespace-pre-line">{event.description}</p>
                    </div>

                    {message && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end">
                        {/* TODO: Check if already registered */}
                        <button
                            onClick={handleRegister}
                            disabled={registering || message}
                            className={`px-8 py-3 rounded-lg font-bold text-white transition-colors ${message ? 'bg-green-500 cursor-default' : 'bg-primary hover:bg-opacity-90'
                                }`}
                        >
                            {registering ? 'Registering...' : message ? 'Registered' : 'Register for Event'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
