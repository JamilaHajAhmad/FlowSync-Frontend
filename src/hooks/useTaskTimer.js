import { useState, useEffect, useMemo } from 'react';
import { calculateTaskTimers, formatTimeRemaining } from '../utils/taskTimers';

export const useTaskTimer = (task) => {
    const [formattedTime, setFormattedTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [timeRemaining, setTimeRemaining] = useState({ 
        isDelayed: false, 
        status: 'normal', 
        daysElapsed: 0,
        daysLeft: 0, // Add daysLeft to initial state
        totalDays: 0, 
        priority: 'Regular',
        delayDuration: 0,
        isFrozen: false
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

            if (task.status === 'Frozen' && frozenTimeData) {
                setFormattedTime(frozenTimeData.formattedTime);
                setTimeRemaining(frozenTimeData.timeRemaining); // Use full timeRemaining object
                return;
            }

            if (task.status === 'Completed' && completedTimeData) {
                setFormattedTime(completedTimeData.formattedTime);
                setTimeRemaining(completedTimeData.timeRemaining); // Use full timeRemaining object
                return;
            }

            // Get timer calculations from utility function
            const timerData = calculateTaskTimers(task);
            const formatted = formatTimeRemaining(timerData.remainingTime);
            
            setFormattedTime(formatted);
            setTimeRemaining({
                isDelayed: timerData.isDelayed,
                status: timerData.status,
                daysElapsed: Math.floor((new Date().getTime() - new Date(task.createdAt).getTime()) / (24 * 60 * 60 * 1000)), // Calculate days elapsed
                daysLeft: timerData.daysLeft,
                totalDays: Math.floor(timerData.totalTime / (1000 * 60 * 60 * 24)),
                priority: timerData.priority,
                delayDuration: timerData.isDelayed ? Math.abs(timerData.remainingTime) : 0,
                isFrozen: false,
                remainingTime: timerData.remainingTime // Add remaining time to state
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

function calculateFrozenTime(task) {
    if (!task.frozenAt) {
        console.error('Frozen task is missing frozenAt timestamp');
        return {
            formattedTime: { days: 0, hours: 0, minutes: 0, seconds: 0 },
            timeRemaining: {
                isDelayed: false,
                status: 'Frozen',
                daysElapsed: 0,
                daysLeft: 0, // Add daysLeft to frozen state
                totalDays: 0,
                priority: task.priority || 'Regular',
                delayDuration: 0,
                isFrozen: true
            }
        };
    }

    // Calculate the time remaining at the moment the task was frozen
    const frozenAt = new Date(task.frozenAt).getTime();
    const openDate = new Date(task.createdAt).getTime();
    const currentTime = new Date().getTime();
    
    // Define time constants
    const DAY_IN_MS = 24 * 60 * 60 * 1000;
    
    const limits = {
        Regular: 7 * DAY_IN_MS,
        Important: 5 * DAY_IN_MS,
        Urgent: DAY_IN_MS
    };

    // Calculate the remaining time at freeze moment
    const priorityLimit = limits[task.priority];
    const totalAllowedTime = openDate + priorityLimit;
    const remainingTimeAtFreeze = totalAllowedTime - frozenAt;
    
    // Calculate total elapsed days from creation until now
    const daysElapsed = Math.floor((currentTime - openDate) / DAY_IN_MS);
    const daysLeft = Math.max(0, Math.floor(remainingTimeAtFreeze / DAY_IN_MS)); // Calculate daysLeft

    // Format the frozen time
    const frozenTimeFormat = formatTimeRemaining(remainingTimeAtFreeze);

    return {
        formattedTime: frozenTimeFormat,
        timeRemaining: {
            isDelayed: remainingTimeAtFreeze < 0,
            status: 'Frozen',
            daysElapsed,
            daysLeft, // Include daysLeft in frozen timeRemaining
            totalDays: Math.floor(priorityLimit / DAY_IN_MS),
            priority: task.priority,
            delayDuration: remainingTimeAtFreeze < 0 ? Math.abs(remainingTimeAtFreeze) : 0,
            isFrozen: true,
            remainingTime: remainingTimeAtFreeze
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
                daysLeft: 0, // Add daysLeft to completed state
                totalDays: 0,
                priority: task.priority || 'Regular',
                delayDuration: 0,
                isFrozen: false
            }
        };
    }

    // Calculate times based on completion timestamp
    const completedAt = new Date(task.completedAt).getTime();
    const openDate = new Date(task.createdAt).getTime();
    
    // Define time constants
    const DAY_IN_MS = 24 * 60 * 60 * 1000;
    
    const limits = {
        Regular: 7 * DAY_IN_MS,
        Important: 5 * DAY_IN_MS,
        Urgent: DAY_IN_MS
    };

    // Calculate final state at completion moment
    const priorityLimit = limits[task.priority];
    const totalAllowedTime = openDate + priorityLimit;
    const finalTimeState = totalAllowedTime - completedAt;
    
    // Calculate days elapsed until completion
    const daysElapsed = Math.floor((completedAt - openDate) / DAY_IN_MS);
    const daysLeft = Math.max(0, Math.floor(finalTimeState / DAY_IN_MS)); // Calculate daysLeft

    // Format the completion time
    const completedTimeFormat = formatTimeRemaining(finalTimeState);

    return {
        formattedTime: completedTimeFormat,
        timeRemaining: {
            isDelayed: finalTimeState < 0,
            status: 'Completed',
            daysElapsed,
            daysLeft, // Include daysLeft in completed timeRemaining
            totalDays: Math.floor(priorityLimit / DAY_IN_MS),
            priority: task.priority,
            delayDuration: finalTimeState < 0 ? Math.abs(finalTimeState) : 0,
            isFrozen: false,
            remainingTime: finalTimeState
        }
    };
}