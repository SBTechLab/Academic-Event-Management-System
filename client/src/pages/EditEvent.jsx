import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EditEvent = () => {
    const { id } = useParams();
    const { getAuthHeaders, role } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        image_url: '',
        event_type: 'technical',
        update_reason: ''
    });

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/events/${id}`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    title: data.title,
                    description: data.description,
                    date: data.date,
                    time: data.time,
                    location: data.location,
                    image_url: data.image_url || '',
                    event_type: data.event_type || 'technical',
                    update_reason: ''
                });
            }
        } catch (err) {
            setError('Failed to load event');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.update_reason.trim()) {
            setError('Please provide a reason for updating this event');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:5001/api/events/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ ...formData, status: 'pending' })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update event');
            }

            const dashboardRoute = role === 'faculty' ? '/faculty-my-events' : '/admin-dashboard';
            navigate(dashboardRoute);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl p-8 mx-auto bg-white border border-gray-200 rounded-lg shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Edit Event</h2>

            {error && (
                <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="title">
                        Event Title
                    </label>
                    <input
                        className="w-full px-3 py-2 leading-tight text-gray-700 border border-gray-300 rounded shadow appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="title"
                        name="title"
                        type="text"
                        required
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="event_type">
                        Event Type
                    </label>
                    <select
                        className="w-full px-3 py-2 leading-tight text-gray-700 border border-gray-300 rounded shadow appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="event_type"
                        name="event_type"
                        required
                        value={formData.event_type}
                        onChange={handleChange}
                    >
                        <option value="technical">Technical</option>
                        <option value="cultural">Cultural</option>
                        <option value="sports">Sports</option>
                        <option value="workshop">Workshop</option>
                        <option value="seminar">Seminar</option>
                        <option value="competition">Competition</option>
                        <option value="general">General</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="description">
                        Description
                    </label>
                    <textarea
                        className="w-full px-3 py-2 leading-tight text-gray-700 border border-gray-300 rounded shadow appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="description"
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                    <div>
                        <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="date">
                            Date
                        </label>
                        <input
                            className="w-full px-3 py-2 leading-tight text-gray-700 border border-gray-300 rounded shadow appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="date"
                            name="date"
                            type="date"
                            required
                            value={formData.date}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="time">
                            Time
                        </label>
                        <input
                            className="w-full px-3 py-2 leading-tight text-gray-700 border border-gray-300 rounded shadow appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="time"
                            name="time"
                            type="time"
                            required
                            value={formData.time}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="location">
                        Location
                    </label>
                    <input
                        className="w-full px-3 py-2 leading-tight text-gray-700 border border-gray-300 rounded shadow appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="location"
                        name="location"
                        type="text"
                        required
                        value={formData.location}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="image_url">
                        Image URL (Optional)
                    </label>
                    <input
                        className="w-full px-3 py-2 leading-tight text-gray-700 border border-gray-300 rounded shadow appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="image_url"
                        name="image_url"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={formData.image_url}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="update_reason">
                        Reason for Update <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        className="w-full px-3 py-2 leading-tight text-gray-700 border border-gray-300 rounded shadow appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="update_reason"
                        name="update_reason"
                        rows="3"
                        required
                        placeholder="Explain why you're updating this event..."
                        value={formData.update_reason}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex items-center justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 font-medium text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update Event'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditEvent;
