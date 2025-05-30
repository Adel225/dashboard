import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthData } from '../../utils/auth';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const authData = getAuthData();

    if (!authData?.user) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute; 