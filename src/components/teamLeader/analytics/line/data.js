const transformApiData = (response) => {
    const { date: apiData, dateRange } = response;

    // Handle empty response
    if (!apiData || apiData.length === 0) {
        const defaultPoint = {
            x: 'No Data',
            y: 0
        };

        return {
            data: [
                {
                    id: "Created Tasks",
                    color: "#ed6c02",
                    data: [defaultPoint]
                },
                {
                    id: "Completed Tasks",
                    color: "#059669",
                    data: [defaultPoint]
                }
            ],
            dateRange: {
                from: 'No date range',
                to: 'No date range'
            },
            totalTasks: 0
        };
    }

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

    let totalTasks = 0;

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

        totalTasks += (item.created + item.completed);
    });

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
        data: [created, completed],
        dateRange: formattedDateRange,
        totalTasks
    };
};

export { transformApiData };