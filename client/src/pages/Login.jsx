import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const navigate = useNavigate();

    const validateSignup = () => {
        if (username.length < 3) {
            setError('Username must be at least 3 characters long');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isRegistering && !validateSignup()) {
            return;
        }

        const endpoint = isRegistering ? '/api/register' : '/api/login';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store user with ID
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('username', data.user.username);
                navigate('/');
            } else {
                setError(data.error || 'Authentication failed');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1>🕐 Timesheet Tracker</h1>
                    <p>{isRegistering ? 'Create New Account' : 'Welcome Back'}</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="error-message">⚠️ {error}</div>}

                    <div className="form-group">
                        <label htmlFor="username">
                            Username {isRegistering && <span className="required">*</span>}
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={isRegistering ? "Minimum 3 characters" : "Enter username"}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Password {isRegistering && <span className="required">*</span>}
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={isRegistering ? "Minimum 6 characters" : "Enter password"}
                            required
                        />
                    </div>

                    {isRegistering && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">
                                Confirm Password <span className="required">*</span>
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="btn-primary btn-login">
                        {isRegistering ? '✓ Create Account' : '→ Sign In'}
                    </button>

                    <div className="toggle-auth">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setError('');
                                setConfirmPassword('');
                            }}
                            className="link-button"
                        >
                            {isRegistering
                                ? '← Already have an account? Login'
                                : "Don't have an account? Register →"}
                        </button>
                    </div>
                </form>

                <div className="login-info">
                    <div className="info-box">
                        <h4>ℹ️ First Time User?</h4>
                        <p>Click "Register" to create your account. Your user ID will be automatically assigned.</p>
                    </div>
                </div>

                <div className="login-footer">
                    <p>Developed by <a href="https://pristonix.com" target="_blank" rel="noopener noreferrer"><b>Pristonix</b></a></p>
                </div>
            </div>
        </div>
    );
}

export default Login;
