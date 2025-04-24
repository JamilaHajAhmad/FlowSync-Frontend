import api from './api';

export const createTask = (taskData, token) => {
    return api.post('/taskmanagement/create-new-task', taskData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};