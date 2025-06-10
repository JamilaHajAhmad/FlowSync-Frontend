import api from './api';
import axios from 'axios';
const API_URL = 'https://localhost:49798';

export const getProfile = async (token) => {
    return api.get('/profile/get-profile', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const updateProfile = async (data, token) => {
    return api.patch('/profile/edit-profile', data, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
};

export const getProfilePicture = async (token) => {
    try {
        const response = await getProfile(token);
        return response.data.pictureURL;
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        return null;
    }
};

export const deleteAccount = async (password,reason, token) => {
    return await axios.post(`${API_URL}/deactivate-account`, { password, reason },{
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}