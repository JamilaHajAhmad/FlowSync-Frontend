const transformApiData = (apiData) => {
    // Create a single data point with all statuses
    return [{
        Opened: apiData.find(item => item.status.type === "Opened")?.count || 0,
        Completed: apiData.find(item => item.status.type === "Completed")?.count || 0,
        Frozen: apiData.find(item => item.status.type === "Frozen")?.count || 0,
        Delayed: apiData.find(item => item.status.type === "Delayed")?.count || 0
    }];
};

export { transformApiData };