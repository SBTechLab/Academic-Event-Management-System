import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { to: '/faculty-dashboard',  icon: '🏠', label: 'Dashboard' },
    { to: '/create-event',       icon: '➕', label: 'Create Event' },
    { to: '/my-faculty-events',  icon: '📋', label: 'My Events' },
];

const BLUE = '#0061ff';

const FacultyLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'F';

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <aside
                className="flex-shrink-0 flex flex-col h-screen sticky top-0 bg-white"
                style={{ width: '260px', borderRight: '1px solid #e5e7eb', boxShadow: '2px 0 12px rgba(0,0,0,0.06)' }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0"
                        style={{ background: BLUE }}>
                        U
                    </div>
                    <div>
                        <p className="font-extrabold text-gray-900 text-lg leading-tight">UniEvents</p>
                        <p className="text-xs text-gray-400 font-medium">Faculty Portal</p>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 px-3 mb-4">Navigation</p>
                    {navItems.map(item => {
                        const active = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base transition-all duration-150"
                                style={active ? { background: '#eff6ff', color: BLUE, borderLeft: `3px solid ${BLUE}` } : { color: '#6b7280' }}
                                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#111827'; } }}
                                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#6b7280'; } }}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile + Logout */}
                <div className="px-4 py-4" style={{ borderTop: '1px solid #f3f4f6' }}>
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2" style={{ background: '#f9fafb' }}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                            style={{ background: BLUE }}>
                            {initials}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-gray-900 text-base font-bold truncate">{user?.full_name}</p>
                            <p className="text-sm font-semibold" style={{ color: BLUE }}>Faculty</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 text-sm font-semibold transition-all hover:bg-red-50 hover:text-red-500"
                    >
                        <span className="text-lg">🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-col flex-1 min-w-0 h-screen">
                <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between"
                    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div>
                        <h2 className="text-gray-900 font-bold text-lg">
                            {navItems.find(n => location.pathname.startsWith(n.to))?.label || 'Faculty Portal'}
                        </h2>
                        <p className="text-gray-400 text-sm">Academic Event Management System</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-gray-800 text-sm font-bold">{user?.full_name}</p>
                            <p className="text-xs font-semibold" style={{ color: BLUE }}>Faculty</p>
                        </div>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ background: BLUE }}>
                            {initials}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>

                <footer className="flex-shrink-0 bg-white border-t border-gray-100 py-3 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} Academic Event Management System
                </footer>
            </div>
        </div>
    );
};

export default FacultyLayout;
