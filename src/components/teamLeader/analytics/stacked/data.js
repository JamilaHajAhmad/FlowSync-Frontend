const transformApiData = (response) => {
    const { date: apiData, dateRange } = response;
    
    // Handle empty response
    if (!apiData || apiData.length === 0) {
        return {
            data: [{
                date: 'No Data',
                activities: 0,
                activitiesColor: '#cbd5e1'
            }],
            dateRange: {
                from: 'No date range',
                to: 'No date range'
            },
            totalActivities: 0
        };
    }

    // Transform the API data into the format needed for the stacked chart
    const chartData = apiData.map(item => ({
        date: formatDate(item.date, 'short'),
        activities: item.count,
        activitiesColor: '#ed6c02'
    }));

    // Calculate total activities
    const totalActivities = chartData.reduce((sum, item) => sum + item.activities, 0);

    // Format date range with safety checks
    const formatDateRange = (dateString) => {
        if (!dateString) return 'No date';
        try {
            return formatDate(dateString, 'full');
        } catch {
            return 'Invalid date';
        }
    };

    const formattedDateRange = {
        from: formatDateRange(dateRange?.from),
        to: formatDateRange(dateRange?.to)
    };

    return {
        data: chartData,
        dateRange: formattedDateRange,
        totalActivities
    };
};

const formatDate = (dateString, format) => {
    try {
        const date = new Date(dateString);
        if (format === 'short') {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

export { transformApiData };