export const calculateStats = (data) => {
    // Validate input data
    if (!data || !Array.isArray(data) || data.length === 0) {
        return {
            mean: 0,
            stdDev: 0,
            maxPerformer: { member: 'N/A', total: 0 },
            minPerformer: { member: 'N/A', total: 0 }
        };
    }

    try {
        // Calculate total tasks for each member with null checks
        const totals = data.map(item => ({
            member: item?.member || 'Unknown',
            total: (
                (Number(item?.opened) || 0) + 
                (Number(item?.completed) || 0) + 
                (Number(item?.frozen) || 0) + 
                (Number(item?.delayed) || 0)
            )
        }));

        // Calculate mean with safe operations
        const mean = totals.reduce((acc, curr) => acc + curr.total, 0) / totals.length;

        // Calculate standard deviation with safe operations
        const variance = totals.reduce((acc, curr) => {
            const diff = curr.total - mean;
            return acc + (diff * diff);
        }, 0) / totals.length;
        const stdDev = Math.sqrt(Math.abs(variance)); // Use Math.abs to ensure non-negative

        // Find max and min performers safely
        const maxPerformer = totals.reduce((max, curr) => 
            curr.total > max.total ? curr : max, 
            { member: 'N/A', total: 0 }
        );

        const minPerformer = totals.reduce((min, curr) => 
            curr.total < min.total ? curr : min,
            { member: 'N/A', total: Number.MAX_VALUE }
        );

        return {
            mean,
            stdDev,
            maxPerformer,
            minPerformer: minPerformer.total === Number.MAX_VALUE ? 
                { member: 'N/A', total: 0 } : minPerformer
        };
    } catch (error) {
        console.error('Error calculating statistics:', error);
        return {
            mean: 0,
            stdDev: 0,
            maxPerformer: { member: 'N/A', total: 0 },
            minPerformer: { member: 'N/A', total: 0 }
        };
    }
};