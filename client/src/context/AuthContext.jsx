import { createContext, useContext, useState, useEffect } from 'react';

// Use backend URL from env or default to localhost
const BACKEND_URL = 'http://localhost:5001/api/users';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token in localStorage on mount
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setRole(parsedUser.role);
            } catch (error) {
                console.error("Failed to parse stored user", error);
                localStorage.removeItem('userInfo');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Save to local storage
            localStorage.setItem('userInfo', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            setUser(data.user);
            setRole(data.user.role);
            return data.user;
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    };

    const signup = async (email, password, fullName) => {
        try {
            const response = await fetch(`${BACKEND_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, full_name: fullName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            // Save to local storage
            localStorage.setItem('userInfo', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            setUser(data.user);
            setRole(data.user.role);
            return data.user;
        } catch (error) {
            console.error('Signup Error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        setUser(null);
        setRole(null);
    };

    // Helper to get headers with token for other requests
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
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

export const useAuth = () => {
    return useContext(AuthContext);
};
