import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Calendar, MapPin } from 'lucide-react';
import { isEventCompleted } from '../eventUtils';

const Achievements = () => {
    const { getAuthHeaders, user } = useAuth();
    const [participantAchievements, setParticipantAchievements] = useState([]);
    const [coordinatorAchievements, setCoordinatorAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAchievements = async () => {
        try {
            const [regsRes, eventsRes] = await Promise.all([
                fetch('http://localhost:5001/api/registrations/my-registrations', { headers: getAuthHeaders() }),
                fetch('http://localhost:5001/api/events?limit=200')
            ]);

            if (!regsRes.ok) throw new Error('Failed to fetch registrations');
            if (!eventsRes.ok) throw new Error('Failed to fetch events');

            const regs = await regsRes.json();
            const allEvents = await eventsRes.json();

            console.log('Regs:', regs.length, regs.map(r => ({ role: r.role_type, status: r.status, event: r.event?.title })));

            const participantCerts = regs
                .filter(r => r.role_type === 'participant' && r.status === 'attended')
                .map(r => ({ ...r, event: allEvents.find(e => e.id === r.event_id) || r.event }))
                .filter(r => {
                    const completed = r.event?.date && isEventCompleted(r.event.date, r.event.time || '00:00:00');
                    console.log('Participant check:', r.event?.title, r.event?.date, r.event?.time, completed);
                    return completed;
                });

            const coordinatorCerts = regs
                .filter(r => r.role_type === 'coordinator' && r.status === 'registered')
                .map(r => ({ ...r, event: allEvents.find(e => e.id === r.event_id) || r.event }))
                .filter(r => {
                    const completed = r.event?.date && isEventCompleted(r.event.date, r.event?.time || '00:00:00');
                    console.log('Coordinator check:', r.event?.title, r.event?.date, r.event?.time, r.status, completed);
                    return completed;
                });

            console.log('Participant certs:', participantCerts.length, participantCerts.map(c => c.event?.title));
            console.log('Coordinator certs:', coordinatorCerts.length, coordinatorCerts.map(c => c.event?.title));

            setParticipantAchievements(participantCerts);
            setCoordinatorAchievements(coordinatorCerts);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, [getAuthHeaders]);

    // Refresh when page becomes visible (tab focus)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchAchievements();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Refresh every 5 seconds for real-time updates
    useEffect(() => {
        const interval = setInterval(fetchAchievements, 5000);
        return () => clearInterval(interval);
    }, []);

    const printCertificate = (record) => {
        const title = record.role_type === 'coordinator' ? 'Coordinator Achievement Certificate' : 'Participation Certificate';
        const roleLabel = record.role_type === 'coordinator' ? 'Coordinator' : 'Participant';
        const eventDate = record.event?.date ? new Date(record.event.date).toLocaleDateString() : 'N/A';
        const location = record.event?.location || 'N/A';

        const html = `
            <html>
                <head>
                    <meta charset="utf-8" />
                    <title>${title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 24px; background: #fff; }
                        .card { border: 1px solid #ddd; padding: 32px; width: 700px; margin: 0 auto; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .header h1 { margin: 0; font-size: 26px; }
                        .line { border-top: 1px dashed #ccc; margin: 18px 0; }
                        .item { margin: 10px 0; font-size: 18px; }
                        .item .label { font-weight: bold; }
                        .footer { margin-top: 32px; text-align: right; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="header">
                            <h1>${title}</h1>
                            <p style="font-size:14px;color:#555; margin-top:6px;">This certificate is awarded to recognize outstanding performance and participation.</p>
                        </div>
                        <div class="item"><span class="label">Name:</span> ${user?.full_name || 'User'}</div>
                        <div class="item"><span class="label">Role:</span> ${roleLabel}</div>
                        <div class="item"><span class="label">Event:</span> ${record.event?.title || 'Event Name'}</div>
                        <div class="item"><span class="label">Date:</span> ${eventDate}</div>
                        <div class="item"><span class="label">Location:</span> ${location}</div>
                        <div class="line"></div>
                        <div class="footer">UniEvents • Academic Event Management System</div>
                    </div>
                </body>
            </html>
        `;

        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(html);
            newWindow.document.close();
            newWindow.focus();
            newWindow.print();
        } else {
            alert('Please allow popups to download certificate.');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64 text-gray-500 font-semibold">Loading achievements...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900">My Achievements</h1>
                <p className="text-gray-500 mt-1">Certificates for events you have successfully attended and completed.</p>
            </div>

            {participantAchievements.length === 0 && coordinatorAchievements.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No certificates yet</h3>
                    <p className="text-gray-500 mt-1">Attend events or get coordinator approval to generate certificates.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {participantAchievements.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Participant Certificates</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {participantAchievements.map(item => (
                                    <div key={`p-${item.id}`} className="p-4 border rounded-lg bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-gray-500">Event</p>
                                                <p className="font-semibold text-gray-800">{item.event?.title || 'Unknown event'}</p>
                                            </div>
                                            <button
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                                onClick={() => printCertificate(item)}
                                            >
                                                Download
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Date: {item.event?.date || 'N/A'}</p>
                                        <p className="text-xs text-gray-500">Status: {item.status}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {coordinatorAchievements.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Coordinator Certificates</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {coordinatorAchievements.map(item => (
                                    <div key={`c-${item.id}`} className="p-4 border rounded-lg bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-gray-500">Event</p>
                                                <p className="font-semibold text-gray-800">{item.event?.title || 'Unknown event'}</p>
                                            </div>
                                            <button
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                                onClick={() => printCertificate(item)}
                                            >
                                                Download
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Date: {item.event?.date || 'N/A'}</p>
                                        <p className="text-xs text-gray-500">Status: {item.status}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Achievements;
