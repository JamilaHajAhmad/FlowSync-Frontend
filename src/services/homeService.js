import api from './api';

export const fetchLeaderAnnualKPI = (token) =>
    api.get(`/kpi/leader/annual-kpi`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });

export const fetchAdminLeaderAnnualKPI = (token) =>
    api.get(`/kpi/admin/leader-annual-kpi`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });

export const fetchTasksByYear = (token) =>
    api.get(`/reports/leader/tasks-by-year`, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const fetchYearlyKPI = (token) =>
    api.get(`/reports/leader/yearly-kpi`, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const fetchMonthlyTaskStatusSummary = (token) =>
    api.get(`/reports/leader/monthly-task-status-summary`, {
        headers: { Authorization: `Bearer ${token}` },
    });