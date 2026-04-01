import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, CalendarDays, LayoutDashboard, LogOut, Users, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { to: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/event-stats', label: 'Event Statistics', icon: BarChart3 },
    { to: '/event-coordinators', label: 'Event Coordinators', icon: Users },
    { to: '/events', label: 'All Events', icon: CalendarDays },
];

const BLUE = '#0061ff';

const SidebarContent = ({ navItems, location, user, initials, handleLogout, onClose }) => (
    <>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0"
                style={{ background: BLUE }}>
                U
            </div>
            <div className="flex-1">
                <p className="font-extrabold text-gray-900 text-lg leading-tight">UniEvents</p>
                <p className="text-xs text-gray-400 font-medium">Admin Portal</p>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
                >
                    <X className="h-6 w-6" />
                </button>
            )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 px-3 mb-4">Navigation</p>
            {navItems.map(item => {
                const active = location.pathname === item.to;
                const Icon = item.icon;
                return (
                    <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base transition-all duration-150"
                        style={active ? { background: '#eff6ff', color: BLUE, borderLeft: `3px solid ${BLUE}` } : { color: '#6b7280' }}
                        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#111827'; } }}
                        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#6b7280'; } }}
                        onClick={onClose}
                    >
                        <Icon size={18} className="shrink-0 opacity-90" />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>

        {/* User Profile + Logout */}
        <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2 bg-gray-50">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                    style={{ background: BLUE }}>
                    {initials}
                </div>
                <div className="overflow-hidden">
                    <p className="text-gray-900 text-base font-bold truncate">{user?.full_name}</p>
                    <p className="text-sm font-semibold" style={{ color: BLUE }}>Admin</p>
                </div>
            </div>
            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 text-sm font-semibold transition-all hover:bg-red-50 hover:text-red-500"
            >
                <LogOut size={18} className="shrink-0" />
                <span>Logout</span>
            </button>
        </div>
    </>
);

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'A';

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
                        <SidebarContent
                            navItems={navItems}
                            location={location}
                            user={user}
                            initials={initials}
                            handleLogout={handleLogout}
                            onClose={() => setSidebarOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-shrink-0 lg:flex-col lg:h-screen lg:sticky lg:top-0 lg:bg-white lg:border-r lg:border-gray-200 lg:shadow-sm"
                style={{ width: '260px' }}>
                <SidebarContent
                    navItems={navItems}
                    location={location}
                    user={user}
                    initials={initials}
                    handleLogout={handleLogout}
                />
            </aside>

            {/* Main Content */}
            <div className="flex flex-col flex-1 min-w-0 h-screen">
                <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <span className="sr-only">Open sidebar</span>
                            <Menu className="h-6 w-6" />
                        </button>
                        <div>
                            <h2 className="text-gray-900 font-bold text-lg">
                                {navItems.find(n => location.pathname.startsWith(n.to))?.label || 'Admin Portal'}
                            </h2>
                            <p className="text-gray-400 text-sm">Academic Event Management System</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle Removed */}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <Outlet />
                </main>

                <footer className="flex-shrink-0 bg-white border-t border-gray-100 py-3 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} Academic Event Management System
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;
