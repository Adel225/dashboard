import React, { useState, useEffect } from 'react';
import '../student/pages/Profile.css';

const TeacherProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchTeacherProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('https://backend-edu-site-5cnm.vercel.app/teacher/profile', {
                    headers: {
                        'Authorization': `MonaEdu ${token}`
                    }
                });
                const data = await response.json();
                if (data.Message === "Done" || data.Message === "Done ") {
                    setUser(data.user);
                } else {
                    setError('Failed to load profile');
                }
            } catch (err) {
                setError('Error loading profile');
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherProfile();
    }, []);

    const handleChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwords.newPassword !== passwords.confirmNewPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://backend-edu-site-5cnm.vercel.app/teacher/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                })
            });

            const data = await response.json();
            if (data.Message === "Done" || data.Message === "Done ") {
                setSuccess('Password updated successfully');
                setPasswords({
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: ''
                });
            } else {
                setError(data.Message || 'Failed to update password');
            }
        } catch (err) {
            setError('Error updating password');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>Error loading profile</div>;
    }

    return (
        <div className="profile-container">
            <h2>Profile</h2>
            <div className="profile-info">
                <div className="info-group">
                    <label>Username:</label>
                    <span>{user.username}</span>
                </div>
                <div className="info-group">
                    <label>Email:</label>
                    <span>{user.email}</span>
                </div>
                <div className="info-group">
                    <label>Role:</label>
                    <span>Teacher</span>
                </div>
            </div>

            <div className="password-section">
                <h3>Change Password</h3>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Current Password:</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwords.currentPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password:</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwords.newPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm New Password:</label>
                        <input
                            type="password"
                            name="confirmNewPassword"
                            value={passwords.confirmNewPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="save-button">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default TeacherProfile; 