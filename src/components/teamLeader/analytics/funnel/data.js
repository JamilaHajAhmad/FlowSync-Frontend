const transformApiData = (apiData) => {
    if (!apiData || apiData.length === 0) return [];

    // Define color mapping
    const colorMap = {
        'DeleteAccount': '#d32f2f',
        'FreezeTask': '#1976D2',   
        'CompleteTask': '#059669',
        'SignUp': '#cbd5e1', 
        'ChangeStatus': '#ed6c02',    
    };

    const typeCounts = new Map();

    // Aggregate counts by type
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
            color: colorMap[type] || '#cbd5e1' // default gray color for unknown types
        }))
        .sort((a, b) => b.value - a.value); // Sort by value descending

    console.log('Final Funnel Data:', result);
    return result;
};

export { transformApiData };