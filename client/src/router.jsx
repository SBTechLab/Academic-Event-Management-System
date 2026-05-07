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
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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
import EventCalendar from './pages/EventCalendar';
import EventStats from './pages/EventStats';
import EventCoordinators from './pages/EventCoordinators';
import FacultyMyEvents from './pages/FacultyMyEvents';
import Achievements from './pages/Achievements';

const GuestOnly = () => {
    const { user } = useAuth();
    if (user) return <Navigate to="/dashboard" replace />;
    return <Outlet />;
};

const RequireAuth = ({ allowedRoles }) => {
    const { user, role } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(role)) {
        if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
        if (role === 'faculty') return <Navigate to="/faculty-dashboard" replace />;
        return <Navigate to="/student-dashboard" replace />;
    }
    return <Outlet />;
};

const DashboardRedirect = () => {
    const { role } = useAuth();
    if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (role === 'faculty') return <Navigate to="/faculty-dashboard" replace />;
    return <Navigate to="/student-dashboard" replace />;
};

const RoleLayout = () => {
    const { role } = useAuth();
    if (role === 'admin') return <AdminLayout />;
    if (role === 'faculty') return <FacultyLayout />;
    return <StudentLayout />;
};

const AdminGuard = () => {
    const { user, role } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (role !== 'admin') return <Navigate to="/dashboard" replace />;
    return <AdminLayout />;
};

const FacultyGuard = () => {
    const { user, role } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (role !== 'faculty') return <Navigate to="/dashboard" replace />;
    return <FacultyLayout />;
};

const StudentGuard = () => {
    const { user, role } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (role !== 'student' && role !== 'student_coordinator') return <Navigate to="/dashboard" replace />;
    return <StudentLayout />;
};

const router = createBrowserRouter([
    // Public routes
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'about', element: <About /> },
            {
                path: 'dashboard',
                element: <RequireAuth />,
                children: [{ index: true, element: <DashboardRedirect /> }]
            },
            {
                element: <GuestOnly />,
                children: [
                    { path: 'login',           element: <Login /> },
                    { path: 'signup',          element: <Signup /> },
                    { path: 'forgot-password', element: <ForgotPassword /> },
                    { path: 'reset-password',  element: <ResetPassword /> },
                ],
            },
        ],
    },

    // Admin routes
    {
        path: '/',
        element: <AdminGuard />,
        children: [
            { path: 'admin-dashboard',        element: <AdminDashboard /> },
            { path: 'event-stats',            element: <EventStats /> },
            { path: 'event-coordinators',     element: <EventCoordinators /> },
            { path: 'coordinator-review/:id', element: <CoordinatorReview /> },
            { path: 'coordinator-requests',   element: <CoordinatorRequests /> },
        ],
    },

    // Faculty routes
    {
        path: '/',
        element: <FacultyGuard />,
        children: [
            { path: 'faculty-dashboard',  element: <FacultyDashboard /> },
            { path: 'create-event',       element: <CreateEvent /> },
            { path: 'my-faculty-events',  element: <FacultyMyEvents /> },
            { path: 'events/:id/edit',    element: <EditEvent /> },
        ],
    },

    // Student routes
    {
        path: '/',
        element: <StudentGuard />,
        children: [
            { path: 'student-dashboard',          element: <StudentDashboard /> },
            { path: 'my-events',                  element: <MyEvents /> },
            { path: 'achievements',               element: <Achievements /> },
            { path: 'coordinator/event/:eventId', element: <CoordinatorDashboard /> },
        ],
    },

    // Shared authenticated routes
    {
        path: '/',
        element: <RequireAuth />,
        children: [{
            element: <RoleLayout />,
            children: [
                { path: 'events',          element: <Events /> },
                { path: 'events/:id',      element: <EventDetails /> },
                { path: 'event-calendar',  element: <EventCalendar /> },
            ],
        }],
    },

    { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

export default router;
