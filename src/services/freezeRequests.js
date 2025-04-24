import api from './api';

export const getAllFreezeRequests = () => {
    return api.get('/freezetaskrequests/all-freeze-requests');
};

export const approveFreezeRequest = (id) => {
    return api.post(`/freezetaskrequests/${id}/approve`);
};

export const rejectFreezeRequest = (id) => {
    return api.post(`/freezetaskrequests/${id}/reject`);
};