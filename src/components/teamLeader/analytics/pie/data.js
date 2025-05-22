const transformApiData = (apiData) => {
    const colors = {
        Opened: "hsl(23, 70%, 50%)",
        Completed: "rgb(1, 48, 34)",
        Frozen: "hsl(231, 70%, 50%)",
        Delayed: "hsl(348, 70%, 50%)"
    };

    return apiData.map(item => ({
        id: item.status.type,
        label: item.status.type,
        value: item.count,
        color: colors[item.status.type]
    }));
};

export { transformApiData };