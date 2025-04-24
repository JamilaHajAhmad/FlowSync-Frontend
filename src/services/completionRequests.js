import api from './api';

export const getAllCompletionRequests = () => {
    return api.get('/completetaskrequests/all-complete-requests');
};

export const approveCompletionRequest = (id) => {
    return api.post(`/completetaskrequests/${id}/approve`);
};

export const rejectCompletionRequest = (id) => {
    return api.post(`/completetaskrequests/${id}/reject`);
};