const transformApiData = (apiData) => {
    return apiData.map(item => ({
        id: item.status.type,
        label: item.status.type,
        value: item.count,
        color: getStatusColor(item.status.type)
    }));
};

const getStatusColor = (status) => {
    switch (status) {
        case 'Opened':
            return '#ed6c02';
        case 'Completed':
            return '#059669';
        case 'Frozen':
            return '#1976D2';
        case 'Delayed':
            return '#d32f2f';
        default:
            return '#999999';
    }
};

export { transformApiData };