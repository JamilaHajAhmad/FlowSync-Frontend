import api from './api';

export const createEvent = async (eventData, token) => {
    return await api.post(`/calender`, eventData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

export const deleteEvent = async (eventId, token) => {
    return await api.delete(`/calender/${eventId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}
