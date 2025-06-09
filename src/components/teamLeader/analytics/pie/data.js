const transformApiData = (response) => {
    const { date: apiData, dateRange } = response;
    
    // Handle empty response
    if (!apiData || apiData.length === 0) {
        return {
            data: [
                {
                    id: 'No Data',
                    label: 'No Data Available',
                    value: 1,
                    color: '#cbd5e1'
                }
            ],
            dateRange: {
                from: 'No date range',
                to: 'No date range'
            },
            totalTasks: 0
        };
    }

    const chartData = apiData.map(item => ({
        id: item.status.type,
        label: item.status.type,
        value: item.count,
        color: getStatusColor(item.status.type)
    }));

    // Calculate total tasks
    const totalTasks = chartData.reduce((sum, item) => sum + item.value, 0);

    // Format date range with safety checks
    const formatDate = (dateString) => {
        if (!dateString) return 'No date';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const formattedDateRange = {
        from: formatDate(dateRange?.from),
        to: formatDate(dateRange?.to)
    };

    return {
        data: chartData,
        dateRange: formattedDateRange,
        totalTasks
    };
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