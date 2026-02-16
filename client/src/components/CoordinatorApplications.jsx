import { useState, useEffect } from 'react';
import axios from 'axios';

const CoordinatorApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5001/api/coordinator/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(data.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5001/api/coordinator/applications/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Application ${status}!`);
      fetchApplications();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to review application');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Coordinator Applications</h2>
      
      {applications.length === 0 ? (
        <p className="text-gray-500">No applications found.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{app.user.full_name}</h3>
                  <p className="text-sm text-gray-600">{app.user.email}</p>
                  <p className="mt-3 text-gray-700">{app.reason}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Applied: {new Date(app.applied_at).toLocaleString()}
                  </p>
                </div>
                
                <div className="ml-4">
                  <span className={`px-3 py-1 rounded text-sm ${
                    app.status === 'approved' ? 'bg-green-100 text-green-800' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {app.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              {app.status === 'pending' && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleReview(app.id, 'approved')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(app.id, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoordinatorApplications;
