import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import '../index.css'; // Global styles

const Login = () => {
    const [activeTab, setActiveTab] = useState('employee');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password, activeTab);

        setLoading(false);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Invalid credentials');
        }
    };

    return (
        <div className="login-body">
            <div className="login-card">
                <div className="login-header">
                    {/* Assume logo is in public/images/logogo.jpg */}
                    <div className="login-logo">
                        <img src="/images/logogo.jpg" alt="Pristonix" width="80" />
                    </div>
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Please sign in to continue</p>
                </div>

                <div className="role-tabs">
                    <button
                        className={`role-tab ${activeTab === 'employee' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('employee'); setError(''); }}
                    >
                        Employee Login
                    </button>
                    <button
                        className={`role-tab admin-tab ${activeTab === 'admin' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('admin'); setError(''); }}
                    >
                        Admin Login
                    </button>
                </div>

                {error && (
                    <div className="error-message p-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>Username</label>
                        <input
                            type="text"
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#64748b'
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <a href="#" className="forgot-password" style={{ color: '#3b82f6', fontSize: '0.9rem', textDecoration: 'none' }}>Forgot Password?</a>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: activeTab === 'admin' ? 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)' : '#1e40af',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Logging in...' : activeTab === 'admin' ? 'Login as Admin' : 'Login as Employee'}
                    </button>
                </form>

                <div className="login-footer" style={{ marginTop: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <p>Protected by Pristonix Security</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
