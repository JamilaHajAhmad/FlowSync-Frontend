import { createContext, useContext, useState } from 'react';

const ChartDataContext = createContext();

// Define API endpoint mappings with descriptions
const API_ENDPOINTS = {
    'bar': {
        endpoint: 'task-distribution-by-member',
        description: 'Tasks distribution across team members and their current status'
    },
    'line': {
        endpoint: 'tasks-over-months',
        description: 'Monthly task completion trends and patterns'
    },
    'pie': {
        endpoint: 'task-status-summary',
        description: 'Overall distribution of tasks by their current status'
    },
    'stacked': {
        endpoint: 'calendar-activity',
        description: 'Daily task progress and status changes over time'
    },
    'heatmap': {
        endpoint: 'tasks-by-case-source',
        description: 'Task density and distribution across different departments'
    },
    'funnel': {
        endpoint: 'requests-stream-by-type',
        description: 'Request flow analysis showing conversion through different stages'
    }
};

export function ChartDataProvider({ children }) {
    const [chartData, setChartData] = useState(null);
    const [currentEndpoint, setCurrentEndpoint] = useState(null);
    const [currentDescription, setCurrentDescription] = useState(null);

    const updateChartData = (data) => {
        setChartData(data);
        // Set the current endpoint and description based on chart type
        if (API_ENDPOINTS[data.type]) {
            setCurrentEndpoint(API_ENDPOINTS[data.type].endpoint);
            setCurrentDescription(API_ENDPOINTS[data.type].description);
        }
    };

    const getCurrentReportType = () => {
        return currentEndpoint;
    };

    const getCurrentDescription = () => {
        return currentDescription;
    };

    return (
        <ChartDataContext.Provider value={{ 
            chartData, 
            updateChartData,
            getCurrentReportType,
            getCurrentDescription
        }}>
            {children}
        </ChartDataContext.Provider>
    );
}

export const useChartData = () => {
    const context = useContext(ChartDataContext);
    if (!context) {
        throw new Error('useChartData must be used within a ChartDataProvider');
    }
    return context;
};