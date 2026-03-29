import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import FacultyLayout from './layouts/FacultyLayout';
import StudentLayout from './layouts/StudentLayout';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Events from './pages/Events';
import CoordinatorRequests from './pages/CoordinatorRequests';
import CoordinatorReview from './pages/CoordinatorReview';
import MyEvents from './pages/MyEvents';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import EventStats from './pages/EventStats';
import EventCoordinators from './pages/EventCoordinators';
import FacultyMyEvents from './pages/FacultyMyEvents';
import Achievements from './pages/Achievements';

// Redirect logged-in users away from login/signup
const GuestOnly = () => {
    const { user } = useAuth();
    if (user) return <Navigate to="/dashboard" replace />;
    return <Outlet />;
};

// Require login — redirect to login if not authenticated
const RequireAuth = ({ allowedRoles }) => {
    const { user, role } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(role)) {
        // Wrong role — redirect to their correct dashboard
        if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
        if (role === 'faculty') return <Navigate to="/faculty-dashboard" replace />;
        return <Navigate to="/student-dashboard" replace />;
    }
    return <Outlet />;
};

// Redirect /dashboard to role-specific dashboard
const DashboardRedirect = () => {
    const { role } = useAuth();
    if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (role === 'faculty') return <Navigate to="/faculty-dashboard" replace />;
    return <Navigate to="/student-dashboard" replace />;
};

// Dynamic layout wrapper based on role
const RoleLayout = () => {
    const { role } = useAuth();
    if (role === 'admin') return <AdminLayout />;
    if (role === 'faculty') return <FacultyLayout />;
    return <StudentLayout />;
};

const router = createBrowserRouter([
    // Public routes
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: '/about', element: <About /> },
            { path: '/dashboard', element: <RequireAuth />, children: [{ index: true, element: <DashboardRedirect /> }] },
            {
                element: <GuestOnly />,
                children: [
                    { path: '/login',  element: <Login /> },
                    { path: '/signup', element: <Signup /> },
                ],
            },
        ],
    },

    // Admin routes
    {
        element: <RequireAuth allowedRoles={['admin']} />,
        children: [{
            path: '/',
            element: <AdminLayout />,
            children: [
                { path: '/admin-dashboard',        element: <AdminDashboard /> },
                { path: '/event-stats',            element: <EventStats /> },
                { path: '/event-coordinators',     element: <EventCoordinators /> },
                { path: '/coordinator-review/:id', element: <CoordinatorReview /> },
                { path: '/coordinator-requests',   element: <CoordinatorRequests /> },
            ],
        }],
    },

    // Faculty routes
    {
        element: <RequireAuth allowedRoles={['faculty']} />,
        children: [{
            path: '/',
            element: <FacultyLayout />,
            children: [
                { path: '/faculty-dashboard',  element: <FacultyDashboard /> },
                { path: '/create-event',       element: <CreateEvent /> },
                { path: '/my-faculty-events',  element: <FacultyMyEvents /> },
                { path: '/events/:id/edit',    element: <EditEvent /> },
            ],
        }],
    },

    // Student routes
    {
        element: <RequireAuth allowedRoles={['student', 'student_coordinator']} />,
        children: [{
            path: '/',
            element: <StudentLayout />,
            children: [
                { path: '/student-dashboard',          element: <StudentDashboard /> },
                { path: '/my-events',                  element: <MyEvents /> },
                { path: '/achievements',               element: <Achievements /> },
                { path: '/coordinator/event/:eventId', element: <CoordinatorDashboard /> },
            ],
        }],
    },

    // Shared authenticated routes — layout chosen by role
    {
        element: <RequireAuth />,
        children: [{
            path: '/',
            element: <RoleLayout />,
            children: [
                { path: '/events',     element: <Events /> },
                { path: '/events/:id', element: <EventDetails /> },
            ],
        }],
    },

    // Catch-all
    { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
