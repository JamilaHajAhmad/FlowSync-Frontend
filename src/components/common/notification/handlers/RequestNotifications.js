import { useContext } from 'react';
import { NotificationContext } from '../NotificationContext';

export const handleSignupRequestNotification = (requestData) => {
    return {
        id: Date.now(),
        type: 'info',
        title: 'New Sign Up Request',
        message: `${requestData.memberName} has requested to join your team`,
        time: new Date(requestData.requestedAt).toLocaleString(),
        read: false,
        category: 'signup',
        requestId: requestData.requestId,
        data: {
            memberName: requestData.memberName,
            email: requestData.email,
            requestedAt: requestData.requestedAt
        }
    };
};

export const handleFreezeRequestNotification = (requestData) => {
    return {
        id: Date.now(),
        type: 'info',
        title: 'New Freeze Request',
        message: `${requestData.memberName} requested to freeze task ${requestData.frnNumber}`,
        time: new Date(requestData.requestedAt).toLocaleString(),
        read: false,
        category: 'freeze',
        requestId: requestData.requestId,
        data: {
            memberName: requestData.memberName,
            frnNumber: requestData.frnNumber,
            reason: requestData.reason,
            requestedAt: requestData.requestedAt
        }
    };
};

export const handleRequestActionNotification = (request, action) => {
    const isApproved = action === 'approved';
    return {
        id: Date.now(),
        type: isApproved ? 'success' : 'error',
        title: `${request.charAt(0).toUpperCase() + request.slice(1)} Request ${action}`,
        message: getActionMessage(request, action),
        time: new Date().toLocaleString(),
        read: false,
        category: request.category,
        requestId: request.requestId
    };
};

const getActionMessage = (request, action) => {
    switch (request.category) {
        case 'signup':
            return `${request.data.memberName}'s account request has been ${action}`;
        case 'freeze':
            return `Task freeze request (${request.data.frnNumber}) from ${request.data.memberName} has been ${action}`;
        default:
            return `Request has been ${action}`;
    }
};

export const useRequestNotifications = () => {
    const { addNotification } = useContext(NotificationContext);

    const handleNewRequest = (requestData, type) => {
        const notification = type === 'signup' 
            ? handleSignupRequestNotification(requestData)
            : handleFreezeRequestNotification(requestData);
        
        addNotification(notification);
    };

    const handleRequestAction = (request, action) => {
        const notification = handleRequestActionNotification(request, action);
        addNotification(notification);
    };

    return {
        handleNewRequest,
        handleRequestAction,
        
    };
};