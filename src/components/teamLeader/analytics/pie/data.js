const transformApiData = (response) => {
    const { date: apiData, dateRange } = response;
    
    const chartData = apiData.map(item => ({
        id: item.status.type,
        label: item.status.type,
        value: item.count,
        color: getStatusColor(item.status.type)
    }));

    const formattedDateRange = {
        from: formatDate(dateRange.from),
        to: formatDate(dateRange.to)
    };

    return {
        data: chartData,
        dateRange: formattedDateRange
    };
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
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