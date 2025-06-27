import api from './api';

export const getConnectedDevices = async (token) => {
    return await api.get(`/connected-devices`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export const logoutDevice = async (deviceId, token) => {
    return await api.post(`/account/sessions/${deviceId}/logout`, { deviceId }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}