const transformApiData = (response) => {
    const { date: apiData, dateRange } = response;
    
    // Handle empty response
    if (!apiData || apiData.length === 0) {
        return {
            data: [{
                id: 'No Data',
                data: ['Opened', 'Completed', 'Delayed', 'Frozen'].map(status => ({
                    x: status,
                    y: 0
                }))
            }],
            dateRange: {
                from: 'No date range',
                to: 'No date range'
            },
            totalDepartments: 0,
            totalTasks: 0
        };
    }
    
    // Group data by department and status
    const departmentMap = {};
    let totalTasks = 0;
    
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
            totalTasks += item.count;
        }
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
        data: Object.values(departmentMap),
        dateRange: formattedDateRange,
        totalDepartments: Object.keys(departmentMap).length,
        totalTasks: totalTasks
    };
};

export { transformApiData };