

const transformApiData = (apiData) => {
    // Transform the API data into the format needed for the stacked chart
    return apiData.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        }),
        activities: item.count,
        activitiesColor: '#ed6c02'
    }));
};

export { transformApiData };