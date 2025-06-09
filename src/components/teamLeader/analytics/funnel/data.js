const transformApiData = (response) => {
    const { date: apiData, dateRange } = response;
    
    // Return default structure for empty data
    if (!apiData || apiData.length === 0) {
        return {
            data: [
                {
                    id: 'empty_state',
                    value: 0,
                    label: 'No Data Available',
                    color: '#cbd5e1'
                }
            ],
            dateRange: {
                from: 'No date range',
                to: 'No date range'
            }
        };
    }

    // Define color mapping
    const colorMap = {
        'DeleteAccount': '#d32f2f',
        'FreezeTask': '#1976D2',   
        'CompleteTask': '#059669',
        'SignUp': '#cbd5e1', 
        'ChangeStatus': '#ed6c02',    
    };

    const typeCounts = new Map();

    // Aggregate counts by type across all months
    apiData.forEach(item => {
        const type = item.type || 'Unknown';
        const count = parseInt(item.count, 10) || 0;
        const current = typeCounts.get(type) || 0;
        typeCounts.set(type, current + count);
    });

    // Transform to the required format
    const result = Array.from(typeCounts.entries())
        .map(([type, count]) => ({
            id: `step_${type.toLowerCase().replace(/\s+/g, '_')}`,
            value: count,
            label: type,
            color: colorMap[type] || '#cbd5e1'
        }))
        .sort((a, b) => b.value - a.value);

    const formattedDateRange = {
        from: dateRange?.from ? formatDate(dateRange.from) : 'No start date',
        to: dateRange?.to ? formatDate(dateRange.to) : 'No end date'
    };

    return {
        data: result.length > 0 ? result : [{
            id: 'empty_state',
            value: 0,
            label: 'No Activity Recorded',
            color: '#cbd5e1'
        }],
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