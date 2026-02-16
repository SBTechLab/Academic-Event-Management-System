import { useState, useEffect } from 'react';
import axios from 'axios';

const CoordinatorApplication = () => {
  const [reason, setReason] = useState('');
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyApplication();
  }, []);

  const fetchMyApplication = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5001/api/coordinator/my-application', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplication(data.data);
    } catch (error) {
      console.error('Error fetching application:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/coordinator/apply', 
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Application submitted successfully!');
      fetchMyApplication();
      setReason('');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (application) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Coordinator Application Status</h2>
        <div className="space-y-3">
          <p><strong>Status:</strong> 
            <span className={`ml-2 px-3 py-1 rounded ${
              application.status === 'approved' ? 'bg-green-100 text-green-800' :
              application.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {application.status.toUpperCase()}
            </span>
          </p>
          <p><strong>Applied:</strong> {new Date(application.applied_at).toLocaleDateString()}</p>
          <p><strong>Reason:</strong> {application.reason}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Apply for Student Coordinator</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Why do you want to be a coordinator?
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows="5"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Explain your motivation and qualifications..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default CoordinatorApplication;
