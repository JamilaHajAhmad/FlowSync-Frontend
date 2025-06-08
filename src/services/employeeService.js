import api from './api';

export const getEmployeesWithTasks = (token) => {
    return api.get('/membermanagement/members-with-ongoing-tasks', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const getMemberNames = async (token) => {
    return await api.get('/membermanagement/member-names', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

export const getMemberDetails = async (memberId, token) => {
    return await api.get(`/membermanagement/member-details/${memberId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}