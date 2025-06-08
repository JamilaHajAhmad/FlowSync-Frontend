const transformApiData = (response) => {
    const { date: apiData, dateRange } = response;
    
    // Group data by department and status
    const departmentMap = {};
    
    // Initialize all departments with all statuses set to 0
    const statuses = ['Opened', 'Completed', 'Delayed', 'Frozen'];
    
    apiData.forEach(item => {
        if (!departmentMap[item.department]) {
            departmentMap[item.department] = {
                id: item.department,
                data: statuses.map(status => ({
                    x: status,
                    y: 0
                }))
            };
        }
        
        // Update the count for the specific status
        const statusIndex = departmentMap[item.department].data.findIndex(
            d => d.x === item.status
        );
        if (statusIndex !== -1) {
            departmentMap[item.department].data[statusIndex].y = item.count;
        }
    });

    // Format date range
    const formattedDateRange = {
        from: formatDate(dateRange.from),
        to: formatDate(dateRange.to)
    };

    return {
        data: Object.values(departmentMap),
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