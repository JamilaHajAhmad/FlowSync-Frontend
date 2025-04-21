import React from 'react'
import { Navigate } from 'react-router-dom';

export function ProtectedRouter({ children }) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        return <Navigate to='/login' />;
    }
    return children;
}

