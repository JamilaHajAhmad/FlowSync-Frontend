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

export const getMemberTasksToReassign = async (memberId, token) => {
    return await api.get(`/taskmanagement/get-member-tasks-to-reassign/${memberId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
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

export const unfreezeTask = async (frnNumber, token) => {
    return await api.post(`/freezetaskrequests/unfreeze-task`, { frnNumber }, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });
};

export const markTaskAsDelayed = async (frnNumber, token) => {
    return await api.post(`/taskmanagement/mark-delayed-task`,{ frnNumber }, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });
};

export const reassignTask = async (frnNumber, newMemberId, token) => {
    return await api.post('/taskmanagement/reassign-task', 
        { 
            frnNumber,
            newMemberId 
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );
};

