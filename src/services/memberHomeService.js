import api from './api';

export const fetchMemberAnnualKPI = (token) =>
    api.get(`/kpi/member/annual-kpi`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });

export const fetchMemberTasksByYear = (token) =>
    api.get(`/reports/member/tasks-by-year`, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const fetchMemberYearlyKPI = (token) =>
    api.get(`/reports/member/yearly-kpi`, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const fetchMemberMonthlyTaskStatusSummary = (token) =>
    api.get(`/reports/member/monthly-task-status-summary`, {
        headers: { Authorization: `Bearer ${token}` },
    });