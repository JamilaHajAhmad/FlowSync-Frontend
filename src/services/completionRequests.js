import api from './api';

export const getAllCompletionRequests = (token) => {
    return api.get('/completetaskrequests/all-complet-requests', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const approveCompletionRequest = (id, token) => {
    return api.post(`/completetaskrequests/approve-complete-task/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const createCompletionRequest = (data, token) => {
    return api.post(`/completetaskrequests/create-complete-request`, data, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};