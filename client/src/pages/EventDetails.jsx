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

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/events/${id}`);
                if (!response.ok) throw new Error('Event not found');
                const data = await response.json();
                setEvent(data);
                
                // If admin, also fetch registrations
                if (role === 'admin') {
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

        fetchEvent();
    }, [id, role, getAuthHeaders]);

    const handleRegister = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setRegistering(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch('http://localhost:5001/api/registrations', {
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

                    {/* Admin-specific event details */}
                    {role === 'admin' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-blue-800 mb-4">📋 Event Management Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                                        event.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {event.status}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Registrations:</span>
                                    <span className="ml-2 text-gray-900">{registrations.length} participants</span>
                                </div>
                            </div>
                            
                            {registrations.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-medium text-gray-700 mb-2">Registered Participants:</h4>
                                    <div className="max-h-32 overflow-y-auto bg-white rounded border p-2">
                                        {registrations.map((reg, index) => (
                                            <div key={index} className="text-sm text-gray-600 py-1">
                                                • {reg.user?.full_name || 'Unknown'} ({reg.user?.email || 'N/A'})
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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
                        {role === 'admin' ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate('/admin-dashboard')}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                >
                                    ← Back to Dashboard
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleRegister}
                                disabled={registering || message}
                                className={`px-8 py-3 rounded-lg font-bold text-white transition-colors ${
                                    message ? 'bg-green-500 cursor-default' : 'bg-primary hover:bg-opacity-90'
                                }`}
                            >
                                {registering ? 'Registering...' : message ? 'Registered' : 'Register for Event'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
