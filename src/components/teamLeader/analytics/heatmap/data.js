const transformApiData = (apiData) => {
    // Group data by department and status
    const departmentMap = {};
    
    apiData.forEach(item => {
        if (!departmentMap[item.department]) {
            departmentMap[item.department] = {
                id: item.department,
                data: []
            };
        }
        
        // Add the status count to the department's data
        departmentMap[item.department].data.push({
            x: item.status,
            y: item.count
        });
    });

    // Convert map to array and ensure consistent data structure
    return Object.values(departmentMap);
};

export { transformApiData };