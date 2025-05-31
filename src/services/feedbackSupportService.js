import api from './api';

export const submitFeedback = async (feedbackData, token) => {
    return await api.post(`/feedbackandsupport/feedback`, {
        rating: feedbackData.rating,
        message: feedbackData.message,
        canFollowUp: feedbackData.canFollowUp
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const submitSupport = async (supportData, token) => {
    return await api.post(`/feedbackandsupport/support`, {
        requestType: supportData.requestType,
        subject: supportData.subject,
        description: supportData.description,
        priorityLevel: supportData.priorityLevel
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
};