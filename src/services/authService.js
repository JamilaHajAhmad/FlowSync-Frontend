import api from './api';

export const login = (credentials) => {
    return api.post(`/login`, credentials);
};

export const register = (data) => {
    return api.post(`/register`, data);
};

export const forgotPassword = (email) => {
    return api.post(`/forgot-password`, { email });
};

export const resetPassword = ({ token, userId, newPassword }) => {
    return api.post(`/reset-password`, { token, userId, newPassword });
};