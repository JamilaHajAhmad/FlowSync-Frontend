import api from './api';

export const getEmployeesWithTasks = (token) => {
    return api.get('/membermanagement/members-with-ongoing-tasks', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};