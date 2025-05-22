const transformApiData = (apiData) => {
    // Create a map to consolidate counts by member
    const memberMap = apiData.reduce((acc, item) => {
        if (!acc[item.member]) {
            acc[item.member] = {
                member: item.member,
                Opened: 0,
                OpenedColor: "hsl(200, 70%, 50%)",
                Completed: 0,
                CompletedColor: "hsl(120, 70%, 50%)",
                Frozen: 0,
                FrozenColor: "hsl(240, 70%, 50%)",
                Delayed: 0,
                DelayedColor: "hsl(0, 70%, 50%)"
            };
        }
        acc[item.member][item.status] = item.count;
        return acc;
    }, {});

    // Convert map to array
    return Object.values(memberMap);
};

export { transformApiData };
