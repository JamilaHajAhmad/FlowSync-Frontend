const transformApiData = (response) => {
    const { date: apiData, dateRange } = response;

    // Create data series for created and completed tasks
    const created = {
        id: "Created Tasks",
        color: "#ed6c02",
        data: []
    };
    
    const completed = {
        id: "Completed Tasks",
        color: "#059669",
        data: []
    };

    // Transform API data into the required format
    apiData.forEach(item => {
        const monthName = new Date(item.year, item.month - 1, 1)
            .toLocaleString('default', { month: 'long', year: 'numeric' });
        
        created.data.push({
            x: monthName,
            y: item.created
        });
        
        completed.data.push({
            x: monthName,
            y: item.completed
        });
    });

    const formattedDateRange = {
        from: formatDate(dateRange.from),
        to: formatDate(dateRange.to)
    };

    return {
        data: [created, completed],
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