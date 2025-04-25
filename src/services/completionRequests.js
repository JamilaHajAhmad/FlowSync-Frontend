import api from './api';

export const getAllCompletionRequests = (token) => {
    return api.get('/completetaskrequests/all-complete-requests', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const approveCompletionRequest = (id, token) => {
    return api.post(`/completetaskrequests/approve/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const rejectCompletionRequest = (id, token) => {
    return api.post(`/completetaskrequests/reject/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};