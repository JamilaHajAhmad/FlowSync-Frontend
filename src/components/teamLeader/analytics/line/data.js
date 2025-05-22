const transformApiData = (apiData) => {
    // Create data series for created and completed tasks
    const created = {
        id: "Created Tasks",
        color: "hsl(163, 70%, 50%)",
        data: []
    };
    
    const completed = {
        id: "Completed Tasks",
        color: "hsl(348, 70%, 50%)",
        data: []
    };

    // Transform API data into the required format
    apiData.forEach(item => {
        const monthName = new Date(2024, item.month - 1, 1).toLocaleString('default', { month: 'long' });
        created.data.push({
            x: monthName,
            y: item.created
        });
        
        completed.data.push({
            x: monthName,
            y: item.completed
        });
    });

    return [created, completed];
};

export { transformApiData };