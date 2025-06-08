const transformApiData = (response) => {
    const { date: apiData, dateRange } = response;
    
    // Transform the API data into the format needed for the stacked chart
    const chartData = apiData.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        }),
        activities: item.count,
        activitiesColor: '#ed6c02'
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

export { transformApiData };