const transformApiData = (apiData) => {
    // Create a map to consolidate counts by member
    const memberMap = apiData.reduce((acc, item) => {
        if (!acc[item.member]) {
            acc[item.member] = {
                member: item.member,
                Opened: 0,
                OpenedColor: "#ed6c02",     // Changed to orange
                Completed: 0,
                CompletedColor: "#059669",  // Kept green
                Frozen: 0,
                FrozenColor: "#1976D2",     // Changed to blue
                Delayed: 0,
                DelayedColor: "#d32f2f"       // Kept red
            };
        }
        acc[item.member][item.status] = item.count;
        return acc;
    }, {});

    // Convert map to array
    return Object.values(memberMap);
};

export { transformApiData };
