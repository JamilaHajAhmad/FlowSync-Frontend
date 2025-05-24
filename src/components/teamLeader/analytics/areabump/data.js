const transformApiData = (apiData) => {
    if (!apiData || apiData.length === 0) return [];

    // Get unique request types and sort them
    const types = [...new Set(apiData.map(item => item.type))].sort();

    // Get all unique time periods and sort them chronologically
    const periods = [...new Set(apiData.map(item => 
        `${item.year}-${String(item.month).padStart(2, '0')}`
    ))].sort();

    // Create lookup map for quick data access
    const dataMap = new Map();
    apiData.forEach(item => {
        const key = `${item.type}|${item.year}-${String(item.month).padStart(2, '0')}`;
        dataMap.set(key, item.count);
    });

    // Transform data for AreaBump format
    const transformedData = types.map(type => {
        const typeData = {
            id: type,
            data: periods.map(period => ({
                x: period,
                y: dataMap.get(`${type}|${period}`) || 0
            }))
        };

        // Ensure at least one non-zero value exists
        const hasData = typeData.data.some(d => d.y > 0);
        return hasData ? typeData : null;
    }).filter(Boolean); // Remove null entries

    // Validate the transformed data
    if (transformedData.length === 0) {
        console.warn('No valid data after transformation');
        return [];
    }

    // Log the first item for debugging
    console.log('Sample transformed data:', transformedData[0]);

    return transformedData;
};

export { transformApiData };