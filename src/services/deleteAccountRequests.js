import api from './api';

export const getAllDeleteAccountRequests = async (token) => {
    return await api.get('/deleteaccountrequest/all-delete-account-requests', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const approveDeleteAccountRequest = async (requestId, token) => {
    return await api.post(`/deleteaccountrequest/approve-delete-member-request/${requestId}`, null, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const rejectDeleteAccountRequest = async (requestId, token) => {
    return await api.post(`/deleteaccountrequest/reject-delete-member-request/${requestId}`, null, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};