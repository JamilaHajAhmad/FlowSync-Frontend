import api from './api';

export const getTaskDistributionByMember = (token) =>
    api.get('/reports/task-distribution-by-member', {
        headers: { Authorization: `Bearer ${token}` }
    });

export const getCalendarActivity = (token) =>
    api.get('/reports/calendar-activity', {
        headers: { Authorization: `Bearer ${token}` }
    });

export const getTaskStatusSummary = (token) =>
    api.get('/reports/task-status-summary', {
        headers: { Authorization: `Bearer ${token}` }
    });

export const getTasksOverMonths = (token) =>
    api.get('/reports/tasks-over-months', {
        headers: { Authorization: `Bearer ${token}` }
    });

export const getTasksByCaseSource = (token) =>
    api.get('/reports/tasks-by-case-source', {
        headers: { Authorization: `Bearer ${token}` }
    });

export const getRequestsStreamByType = (token) =>
    api.get('/reports/requests-stream-by-type', {
        headers: { Authorization: `Bearer ${token}` }
    });