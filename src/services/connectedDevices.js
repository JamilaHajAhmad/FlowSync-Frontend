import api from './api';
import axios from 'axios';
const API_URL = 'https://localhost:55914';

export const getConnectedDevices = async (token) => {
    return await axios.get(`${API_URL}/connected-devices`, {
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