import api from './api';

export const getAllSignupRequests = (token) => {
    return api.get('/signuprequest/all-signup-requests', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const approveSignupRequest = (id, token) => {
    return api.post(`/signuprequest/approve-member/${id}`, null, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const rejectSignupRequest = (id, token) => {
    return api.post(`/signuprequest/reject-member/${id}`, null, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};