import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for persistent login on refresh
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Basic expiry check (10 hours aligned with old app)
            if (parsed.expiry && new Date().getTime() > parsed.expiry) {
                logout();
            } else {
                setUser(parsed);
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password, role) => {
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await res.json();
            const userData = data.user;

            // Role Check
            if (role === 'employee' && userData.role === 'admin') {
                throw new Error('Admin detected. Use Admin Login.');
            }
            if (role === 'admin' && userData.role !== 'admin') {
                throw new Error('Not an admin.');
            }

            const expiry = new Date().getTime() + (10 * 60 * 60 * 1000);
            const userWithExpiry = { ...userData, expiry };

            localStorage.setItem('currentUser', JSON.stringify(userWithExpiry));
            setUser(userWithExpiry);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('currentUser');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
