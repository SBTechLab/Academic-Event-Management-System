import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyEvents = () => {
    const { getAuthHeaders } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(10);

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/registrations/my-registrations', {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                console.log('My Registrations Data:', data); // Debug log
                setRegistrations(data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h1 className="text-4xl font-bold text-gray-800">My Events</h1>
                    <p className="text-gray-600 mt-1">View all your event registrations and coordinator roles</p>
                </div>

                {registrations.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <p className="text-gray-500 text-lg">You haven't registered for any events yet</p>
                        <Link to="/events" className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium">
                            Browse Events →
                        </Link>
                    </div>
                ) : (
                    <>
                    <div className="grid grid-cols-1 gap-6">
                        {registrations.slice(0, displayCount).map((reg) => (
                            <div key={reg.id} className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-2xl font-bold text-gray-800">{reg.event?.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                reg.role_type === 'coordinator' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {reg.role_type === 'coordinator' ? '⭐ Coordinator' : '👥 Participant'}
                                            </span>
                                            {/* Debug info */}
                                            <span className="text-xs text-gray-400">(role: {reg.role_type || 'null'})</span>
                                        </div>
                                        <div className="flex gap-6 text-sm text-gray-600 mb-3">
                                            <span>📅 {reg.event?.date}</span>
                                            <span>🕐 {reg.event?.time}</span>
                                            <span>📍 {reg.event?.location}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700">Status:</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                reg.event?.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                reg.status === 'registered' ? 'bg-green-100 text-green-700' :
                                                reg.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                reg.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {reg.event?.status === 'cancelled' ? '❌ Cancelled' :
                                                 reg.status === 'registered' ? '✓ Confirmed' :
                                                 reg.status === 'pending' ? '⏳ Pending Approval' :
                                                 reg.status === 'rejected' ? '✗ Rejected' :
                                                 reg.status}
                                            </span>
                                        </div>

                                        {reg.rejection_reason && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-xs font-semibold text-red-800 mb-1">Rejection Reason:</p>
                                                <p className="text-sm text-red-900">{reg.rejection_reason}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Link
                                            to={`/events/${reg.event_id}`}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium text-center"
                                        >
                                            View Event
                                        </Link>
                                        
                                        {reg.role_type === 'coordinator' && reg.status === 'registered' && reg.event?.status !== 'cancelled' && (
                                            <Link
                                                to={`/coordinator/event/${reg.event_id}`}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium text-center"
                                            >
                                                Coordinator Dashboard
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {registrations.length > displayCount && (
                        <div className="text-center mt-6">
                            <button
                                onClick={() => setDisplayCount(prev => prev + 10)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                Show More ({registrations.length - displayCount} remaining)
                            </button>
                        </div>
                    )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyEvents;
