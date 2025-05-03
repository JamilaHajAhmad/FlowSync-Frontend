import { useState, useEffect, useMemo } from 'react';
import { calculateTaskTimers, formatTimeRemaining } from '../utils/taskTimers';

export const useTaskTimer = (task) => {
    const [formattedTime, setFormattedTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [timeRemaining, setTimeRemaining] = useState({ 
        isDelayed: false, 
        status: 'normal', 
        daysElapsed: 0, 
        totalDays: 0, 
        priority: 'Regular',
        delayDuration: 0,
        isFrozen: false // Explicit frozen flag
    });

    const frozenTimeData = useMemo(() => {
        if (!task || task.status !== 'Frozen') return null;
        return calculateFrozenTime(task);
    }, [task]);

    const completedTimeData = useMemo(() => {
        if (!task || task.status !== 'Completed') return null;
        return calculateCompletedTime(task);
    }, [task]);

    useEffect(() => {
        const calculateTime = () => {
            if (!task || !task.createdAt || !task.priority) return;

            // Handle both Frozen and Completed states
            if (task.status === 'Frozen' && frozenTimeData) {
                setFormattedTime(frozenTimeData.formattedTime);
                setTimeRemaining(frozenTimeData.timeRemaining);
                return;
            }

            if (task.status === 'Completed' && completedTimeData) {
                setFormattedTime(completedTimeData.formattedTime);
                setTimeRemaining(completedTimeData.timeRemaining);
                return;
            }

            // Get timer calculations from utility function
            const timerData = calculateTaskTimers(task);
            
            // Format the time (will be delay duration if task is delayed)
            const formatted = formatTimeRemaining(timerData.remainingTime);
            
            setFormattedTime(formatted);
            setTimeRemaining({
                isDelayed: timerData.isDelayed,
                status: timerData.status,
                daysElapsed: timerData.daysElapsed,
                totalDays: Math.floor(timerData.totalTime / (1000 * 60 * 60 * 24)),
                priority: timerData.priority,
                delayDuration: timerData.isDelayed ? timerData.remainingTime : 0,
                isFrozen: false
            });
        };

        // Initial calculation
        calculateTime();

        // Only set up interval if task is not frozen or completed
        let timer;
        if (task.status !== 'Frozen' && task.status !== 'Completed') {
            timer = setInterval(calculateTime, 1000);
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [task, frozenTimeData, completedTimeData]);

    return { formattedTime, timeRemaining };
};

function calculateTaskElapsedDays(createdAt) {
    const now = Date.now();
    const created = new Date(createdAt).getTime();
    return Math.floor((now - created) / (1000 * 60 * 60 * 24));
}

function calculateFrozenTime(task) {
    if (!task.frozenAt) {
        console.error('Frozen task is missing frozenAt timestamp');
        return {
            formattedTime: { days: 0, hours: 0, minutes: 0, seconds: 0 },
            timeRemaining: {
                isDelayed: false,
                status: 'Frozen',
                daysElapsed: 0,
                totalDays: 0,
                priority: task.priority || 'Regular',
                delayDuration: 0,
                isFrozen: true
            }
        };
    }

    const taskTimers = calculateTaskTimers({
        ...task,
        status: 'Opened',
        frozenAt: undefined
    });

    const daysElapsed = calculateTaskElapsedDays(task.createdAt);
    const remainingTimeAtFreeze = taskTimers.remainingTime;
    const frozenTimeFormat = formatTimeRemaining(remainingTimeAtFreeze);

    return {
        formattedTime: frozenTimeFormat,
        timeRemaining: {
            ...taskTimers,
            daysElapsed,
            status: 'Frozen',
            totalDays: Math.floor(taskTimers.totalTime / (1000 * 60 * 60 * 24)),
            isFrozen: true
        }
    };
}

function calculateCompletedTime(task) {
    if (!task.completedAt) {
        console.error('Completed task is missing completedAt timestamp');
        return {
            formattedTime: { days: 0, hours: 0, minutes: 0, seconds: 0 },
            timeRemaining: {
                isDelayed: false,
                status: 'Completed',
                daysElapsed: 0,
                totalDays: 0,
                priority: task.priority || 'Regular',
                delayDuration: 0,
                isFrozen: false
            }
        };
    }

    const taskTimers = calculateTaskTimers({
        ...task,
        status: 'Opened',
        completedAt: undefined
    });

    const daysElapsed = calculateTaskElapsedDays(task.createdAt);
    const finalTimeState = taskTimers.remainingTime;
    const finalTimeFormat = formatTimeRemaining(finalTimeState);

    return {
        formattedTime: finalTimeFormat,
        timeRemaining: {
            ...taskTimers,
            daysElapsed,
            status: 'Completed',
            totalDays: Math.floor(taskTimers.totalTime / (1000 * 60 * 60 * 24)),
            isFrozen: false
        }
    };
}