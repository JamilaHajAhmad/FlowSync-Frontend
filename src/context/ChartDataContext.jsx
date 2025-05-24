import { createContext, useContext, useState } from 'react';

const ChartDataContext = createContext();

export function ChartDataProvider({ children }) {
    const [chartData, setChartData] = useState(null);

    const updateChartData = (data) => {
        setChartData(data);
    };

    return (
        <ChartDataContext.Provider value={{ chartData, updateChartData }}>
            {children}
        </ChartDataContext.Provider>
    );
}

export const useChartData = () => useContext(ChartDataContext);