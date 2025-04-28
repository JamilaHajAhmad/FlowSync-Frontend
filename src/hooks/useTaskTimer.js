import { useState, useEffect } from 'react';
import { calculateTaskTimers, formatTimeRemaining } from '../utils/taskTimers';

export const useTaskTimer = (task) => {
    const [formattedTime, setFormattedTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [timeRemaining, setTimeRemaining] = useState({ 
        isDelayed: false, 
        status: 'normal', 
        daysElapsed: 0, 
        totalDays: 0, 
        priority: 'Regular' 
    });

    useEffect(() => {
        const calculateTime = () => {
            if (!task || !task.createdAt || !task.priority) return;

            // If task is frozen, return the frozen time values
            if (task.status === 'Frozen') {
                const frozenTimeData = calculateFrozenTime(task);
                setFormattedTime(frozenTimeData.formattedTime);
                setTimeRemaining(frozenTimeData.timeRemaining);
                return;
            }

            // Get timer calculations from utility function
            const timerData = calculateTaskTimers(task);
            
            // Format the remaining time
            const formatted = formatTimeRemaining(timerData.remainingTime);
            
            setFormattedTime(formatted);
            setTimeRemaining({
                isDelayed: timerData.isDelayed,
                status: timerData.status,
                daysElapsed: timerData.daysElapsed,
                totalDays: Math.floor(timerData.totalTime / (1000 * 60 * 60 * 24)),
                priority: timerData.priority
            });
        };

        const calculateFrozenTime = (task) => {
            // Calculate the time elapsed until the task was frozen
            const frozenAt = new Date(task.frozenAt);
            const createdAt = new Date(task.createdAt);
            const timeElapsedUntilFrozen = frozenAt - createdAt;

            // Get the total allowed time based on priority
            const timerData = calculateTaskTimers(task);
            const totalAllowedTime = timerData.totalTime;

            // Calculate remaining time at freeze point
            const remainingTimeAtFreeze = totalAllowedTime - timeElapsedUntilFrozen;

            return {
                formattedTime: formatTimeRemaining(remainingTimeAtFreeze),
                timeRemaining: {
                    isDelayed: false,
                    status: 'frozen',
                    daysElapsed: Math.floor(timeElapsedUntilFrozen / (1000 * 60 * 60 * 24)),
                    totalDays: Math.floor(totalAllowedTime / (1000 * 60 * 60 * 24)),
                    priority: task.priority
                }
            };
        };

        // Initial calculation
        calculateTime();

        // Only set up interval if task is not frozen
        let timer;
        if (task.status !== 'Frozen') {
            timer = setInterval(calculateTime, 1000);
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [task]);

    return { formattedTime, timeRemaining };
};