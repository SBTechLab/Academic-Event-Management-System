import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CreateEvent = () => {
    const { user, getAuthHeaders } = useAuth();
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
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/events', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create event');
            }

            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-surface p-8 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-primary mb-6">Create New Event</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-text text-sm font-bold mb-2" htmlFor="title">
                        Event Title
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        id="title"
                        name="title"
                        type="text"
                        required
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-text text-sm font-bold mb-2" htmlFor="description">
                        Description
                    </label>
                    <textarea
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        id="description"
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-text text-sm font-bold mb-2" htmlFor="date">
                            Date
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            id="date"
                            name="date"
                            type="date"
                            required
                            value={formData.date}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-text text-sm font-bold mb-2" htmlFor="time">
                            Time
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    <label className="block text-text text-sm font-bold mb-2" htmlFor="location">
                        Location
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        id="location"
                        name="location"
                        type="text"
                        required
                        value={formData.location}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-text text-sm font-bold mb-2" htmlFor="image_url">
                        Image URL (Optional)
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        id="image_url"
                        name="image_url"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={formData.image_url}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex items-center justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="text-text/70 hover:text-text font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateEvent;
