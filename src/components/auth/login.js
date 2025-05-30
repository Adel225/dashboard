import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authenticateUser, saveAuthData, getAuthData } from '../../utils/auth';
import './auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already authenticated
        const authData = getAuthData();
        if (authData?.user) {
            // Redirect based on user role
            if (authData.user.role === 'teacher') {
                navigate('/dashboard');
            } else {
                navigate(`/student/${authData.user.studentId}`);
            }
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const user = authenticateUser(email, password);
            if (user) {
                saveAuthData(user, rememberMe);
                // Redirect based on user role
                if (user.role === 'teacher') {
                    navigate('/dashboard');
                } else {
                    navigate(`/student/${user.studentId}`);
                }
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            setError('An error occurred during login');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Welcome Back</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <p>Remember me</p>
                        </label>
                    </div>
                    <button type="submit" className="auth-button">Login</button>
                </form>
                <div className="auth-footer">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;