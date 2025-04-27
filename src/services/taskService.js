import api from './api';

export const createTask = (taskData, token) => {
    return api.post('/taskmanagement/create-new-task', taskData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
};

export const getAllTasks = (token, type = '') => {
    return api.get(`/taskmanagement/all-tasks${type ? `?type=${type}` : ''}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const getMemberTasks = async (token, type = 'Opened') => {
    return await api.get(`/taskmanagement/member-tasks?type=${type}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const createFreezeRequest = async (data, token) => {
    return await api.post(
        '/freezetaskrequests/create-freeze-request',
        {
            frnNumber: data.frnNumber,
            reason: data.reason
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};