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

export const getTaskDeadlines = async (token) => {
    return await api.get('/calender/task-deadlines-events', {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
};

export const getEvents = async (token) => {
    return await api.get('/calender', {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
};

export const updateEvent = async (id, eventData, token) => {
    return await api.patch(`/calender/${id}`, eventData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
};
