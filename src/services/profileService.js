import api from './api';

export const getProfile = async (token) => {
    return api.get('/profile/get-profile', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const updateProfile = async (token, data) => {
    return api.put('/profile/edit-profile', data, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}