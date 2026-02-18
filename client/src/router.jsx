import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import Events from './pages/Events';
import CoordinatorRequests from './pages/CoordinatorRequests';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Dashboard redirect component
const DashboardRedirect = () => {
    const { role } = useAuth();
    
    switch (role) {
        case 'admin':
            return <Navigate to="/admin-dashboard" replace />;
        case 'faculty':
            return <Navigate to="/faculty-dashboard" replace />;
        case 'student':
            return <Navigate to="/student-dashboard" replace />;
        default:
            return <Navigate to="/student-dashboard" replace />;
    }
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/dashboard',
                element: <DashboardRedirect />,
            },
            {
                path: '/events',
                element: <Events />,
            },
            {
                path: '/login',
                element: <Login />,
            },
            {
                path: '/signup',
                element: <Signup />,
            },
            {
                path: '/student-dashboard',
                element: <StudentDashboard />,
            },
            {
                path: '/faculty-dashboard',
                element: <FacultyDashboard />,
            },
            {
                path: '/admin-dashboard',
                element: <AdminDashboard />,
            },
            {
                path: '/coordinator-requests',
                element: <CoordinatorRequests />,
            },
            {
                path: '/events/:id',
                element: <EventDetails />,
            },
            {
                path: '/create-event',
                element: <CreateEvent />,
            },
        ],
    },
]);

export default router;
