import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import Events from './pages/Events';

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
                path: '/dashboard',
                element: <Dashboard />,
            },
            {
                path: '/events/:id',
                element: <EventDetails />,
            },
            {
                path: '/events/create',
                element: <CreateEvent />,
            },
        ],
    },
]);

export default router;
