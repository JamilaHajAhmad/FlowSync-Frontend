import api from './api';

export const getAllDeleteAccountRequests = async (token) => {
    return await api.get('/deactivateaccountrequest/all-deactivation-account-requests', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const approveDeleteAccountRequest = async (requestId, token) => {
    return await api.post(`/deactivateaccountrequest/approve-deactivation-member-request/${requestId}`, null, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const rejectDeleteAccountRequest = async (requestId, token) => {
    return await api.post(`/deactivateaccountrequest/reject-deactivation-member-request/${requestId}`, null, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};