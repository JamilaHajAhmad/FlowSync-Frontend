import api from './api';

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

export const deleteAccount = async (password, reason, token) => {
    return await api.post(`/deactivate-account`, { password, reason }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const changePassword = (token, { currentPassword, newPassword, confirmPassword }) => {
    return api.post(
        `/change-password`,
        { currentPassword, newPassword, confirmPassword },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};