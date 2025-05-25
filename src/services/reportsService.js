import api from './api';

export const getAllReports = async () => {
    return await api.get('/reports/all-reports', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
    });
};

export const saveReport = async (reportType, description, file) => {
    try {
        const token = localStorage.getItem('authToken');
        const formData = new FormData();
        formData.append('description', description);
        formData.append('file', file);

        const response = await api.post(
            `/reports/save-report/${reportType}`,
            formData,
            {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        console.log('Report saved successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error saving report:', error);
        throw new Error(error.response?.data?.message || 'Failed to save report');
    }
};