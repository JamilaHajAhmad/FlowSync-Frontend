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