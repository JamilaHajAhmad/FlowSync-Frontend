import api from './api';

export const getAllChangeStatusRequests = async (token) => {
    return await api.get('/changestatusrequests/all-change-status-requests', {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const approveChangeStatusRequest = async (requestId, token) => {
    return await api.post(`/changestatusrequests/approve/${requestId}`, null, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const rejectChangeStatusRequest = async (requestId, token) => {
    return await api.post(`/changestatusrequests/reject/${requestId}`, null, {
        headers: { Authorization: `Bearer ${token}` }
    });
};