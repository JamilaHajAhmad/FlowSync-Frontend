import api from './api';

export const getAllFreezeRequests = (token) => {
    return api.get('/freezetaskrequests/all-freeze-requests', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const approveFreezeRequest = (id, token) => {
    return api.post(`/freezetaskrequests/approve/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const rejectFreezeRequest = (id, token) => {
    return api.post(`/freezetaskrequests/reject/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};