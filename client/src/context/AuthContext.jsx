import { createContext, useContext, useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:5001/api/users';

const AuthContext = createContext();

const toFriendlyAuthError = (message) => {
    const m = String(message || '').toLowerCase();

    // Postgres unique constraint / Supabase errors for duplicate email
    if (
        m.includes('users_email_key') ||
        m.includes('duplicate key value') ||
        (m.includes('unique') && m.includes('email')) ||
        m.includes('already registered') ||
        m.includes('already exists')
    ) {
        return 'Email already exists. Please log in.';
    }

    return message || 'Something went wrong. Please try again.';
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('userInfo');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setRole(parsedUser.role);
            } catch {
                sessionStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await fetch(`${BACKEND_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');

        sessionStorage.setItem('userInfo', JSON.stringify(data.user));
        sessionStorage.setItem('token', data.token);
        setUser(data.user);
        setRole(data.user.role);
        return data.user;
    };

    const signup = async (email, password, fullName) => {
        const response = await fetch(`${BACKEND_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, full_name: fullName }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(toFriendlyAuthError(data.error || 'Signup failed'));

        sessionStorage.setItem('userInfo', JSON.stringify(data.user));
        sessionStorage.setItem('token', data.token);
        setUser(data.user);
        setRole(data.user.role);
        return data.user;
    };

    const logout = () => {
        sessionStorage.clear();
        localStorage.clear();
        setUser(null);
        setRole(null);
    };

    const getAuthHeaders = () => {
        const token = sessionStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    };

    return (
        <AuthContext.Provider value={{ user, role, login, signup, logout, loading, getAuthHeaders }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
