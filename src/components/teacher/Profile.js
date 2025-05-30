import React, { useState } from 'react';
import { getAuthData, updateUserPassword, saveAuthData } from '../../utils/auth';
import '../student/pages/Profile.css';

const TeacherProfile = () => {
    const authData = getAuthData();
    const user = authData?.user;

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwords.newPassword !== passwords.confirmNewPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            const updatedUser = updateUserPassword(
                user.studentId, // we'll still use this as ID internally
                passwords.currentPassword,
                passwords.newPassword
            );

            // Update the session storage with new user data
            saveAuthData(updatedUser, authData.rememberMe);
            
            setSuccess('Password updated successfully');
            setPasswords({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            });
        } catch (err) {
            setError(err.message);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
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