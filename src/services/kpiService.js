import api from './api';

export const getTeamKpis = (token, year, isAdmin) => {
    const endpoint = isAdmin
        ? `/kpi/admin/team-kpis?year=${year}`
        : `/kpi/leader/team-kpis?year=${year}`;
    return api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
    });
};