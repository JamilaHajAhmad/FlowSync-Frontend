const transformApiData = (response) => {
    const { date: apiData, dateRange } = response;

    // Handle empty response
    if (!apiData || apiData.length === 0) {
        return {
            data: [{
                member: 'No Data Available',
                Opened: 0,
                OpenedColor: "#ed6c02",
                Completed: 0,
                CompletedColor: "#059669",
                Frozen: 0,
                FrozenColor: "#1976D2",
                Delayed: 0,
                DelayedColor: "#d32f2f"
            }],
            dateRange: {
                from: 'No date range',
                to: 'No date range'
            }
        };
    }

    // Create a map to consolidate counts by member
    const memberMap = apiData.reduce((acc, item) => {
        if (!acc[item.member]) {
            acc[item.member] = {
                member: item.member,
                Opened: 0,
                OpenedColor: "#ed6c02",
                Completed: 0,
                CompletedColor: "#059669",
                Frozen: 0,
                FrozenColor: "#1976D2",
                Delayed: 0,
                DelayedColor: "#d32f2f"
            };
        }
        acc[item.member][item.status] = item.count;
        return acc;
    }, {});
    
    // Format date range
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
        data: Object.values(memberMap),
        dateRange: formattedDateRange,
    };
};

export { transformApiData };