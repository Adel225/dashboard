import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../auth/auth.css';
import { API_URL } from '../../config';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${API_URL}/student/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();
            console.log('Login response:', data); // Debug log
            
            if (data.token) {
                // Store token based on Remember Me choice
                if (rememberMe) {
                    localStorage.setItem('token', data.token);
                } else {
                    sessionStorage.setItem('token', data.token);
                }
                navigate('/student/');
            } else {
                // Display error message from API
                setError(data.Message || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred during login');
            console.error('Login error:', err);
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
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="form-input"
                            />
                            <span 
                                className="password-toggle-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>
                    <div className="form-group remember-me">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Remember Me</span>
                        </label>
                    </div>
                    <button type="submit" className="auth-button">Login</button>
                </form>
                <div className="auth-footer">
                    <div className="signup-link">
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </div>
                    <div className="teacher-login">
                        <Link to="/admin/login" className="teacher-login-link">Login as Teacher</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;