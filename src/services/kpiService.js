import api from './api';

export const getTeamKpis = (token, year, isAdmin) => {
    const endpoint = isAdmin
        ? `/kpi/admin/team-kpis?year=${year}`
        : `/kpi/leader/team-kpis?year=${year}`;
    return api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getMyKpiRank = (token, year) => {
    return api.get(`/kpi/member/my-kpi-rank?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};