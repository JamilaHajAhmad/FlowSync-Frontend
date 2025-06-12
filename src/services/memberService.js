import api from './api';

export const getAllMembers = async (token) => {
    return await api.get('/membermanagement/all-members',
        {
            headers: {  
                Authorization: `Bearer ${token}`,
            }
        }
    );
};

export const deleteMember = async (id, token) => {
    return await api.delete(`/membermanagement/deactivate-member/${id}`,
        {
            headers: {  
                Authorization: `Bearer ${token}`,
            }
        }
    );
}