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

            // Handle Frozen tasks
            if (task.status === 'Frozen' && frozenTimeData) {
                setFormattedTime(frozenTimeData.formattedTime);
                setTimeRemaining(frozenTimeData.timeRemaining);
                return;
            }

            // For unfrozen tasks that were previously frozen
            const offset = task.lastUnfrozenAt ? 
                (new Date(task.lastUnfrozenAt).getTime() - new Date(task.frozenAt).getTime()) : 0;

            // Get timer calculations from utility function with offset
            const timerData = calculateTaskTimers(task, offset);

            // If time is up, lock at zero and don't continue counting
            if (timerData.remainingTime <= 0) {
                const delayDuration = Math.abs(timerData.remainingTime);
                const daysDelayed = Math.floor(delayDuration / (24 * 60 * 60 * 1000));

                setFormattedTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setTimeRemaining(prev => ({
                    ...prev,
                    isDelayed: true,
                    status: 'Delayed',
                    daysElapsed: daysDelayed,
                    delayDuration: delayDuration,
                    remainingTime: 0
                }));
                return;
            }

            const formatted = formatTimeRemaining(timerData.remainingTime);
            setFormattedTime(formatted);

            // Calculate days elapsed using fixed timestamps
            const now = new Date().getTime();
            const createdAt = new Date(task.createdAt).getTime();
            const daysElapsed = Math.floor((now - createdAt) / (24 * 60 * 60 * 1000));

            setTimeRemaining({
                isDelayed: timerData.isDelayed,
                status: timerData.status,
                daysElapsed,
                daysLeft: timerData.daysLeft,
                totalDays: Math.floor(timerData.totalTime / (1000 * 60 * 60 * 24)),
                priority: timerData.priority,
                delayDuration: timerData.isDelayed ? Math.abs(timerData.remainingTime) : 0,
                isFrozen: false,
                remainingTime: timerData.remainingTime
            });
        };

        calculateTime();
        let timer;
        if (task.status === 'Opened') {
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
                daysLeft: 0,
                totalDays: 0,
                priority: task.priority || 'Regular',
                delayDuration: 0,
                isFrozen: true
            }
        };
    }

    const frozenAt = new Date(task.frozenAt).getTime();
    const openDate = new Date(task.createdAt).getTime();
    const DAY_IN_MS = 24 * 60 * 60 * 1000;
    
    const limits = {
        Regular: 15 * 60 * 1000,
        Important: 10 * 60 * 1000,
        Urgent: 1 * 60 * 1000
    };

    const priorityLimit = limits[task.priority];
    // Calculate time elapsed before freezing
    const timeElapsedBeforeFreeze = frozenAt - openDate;
    // Calculate remaining time at freeze point
    const remainingTimeAtFreeze = priorityLimit - timeElapsedBeforeFreeze;
    
    const daysElapsed = Math.floor(timeElapsedBeforeFreeze / DAY_IN_MS);
    const daysLeft = Math.max(0, Math.floor(remainingTimeAtFreeze / DAY_IN_MS));

    const frozenTimeFormat = formatTimeRemaining(remainingTimeAtFreeze, task.priority);

    return {
        formattedTime: frozenTimeFormat,
        timeRemaining: {
            isDelayed: remainingTimeAtFreeze < 0,
            status: 'Frozen',
            daysElapsed,
            daysLeft,
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
                daysLeft: 0,
                totalDays: 0,
                priority: task.priority || 'Regular',
                delayDuration: 0,
                isFrozen: false
            }
        };
    }

    const completedAt = new Date(task.completedAt).getTime();
    const openDate = new Date(task.createdAt).getTime();
    
    const DAY_IN_MS = 24 * 60 * 60 * 1000;
    
    const limits = {
        Regular: 15 * 60 * 1000,
        Important: 10 * 60 * 1000,
        Urgent: 1 * 60 * 1000
    };

    const priorityLimit = limits[task.priority];
    const totalAllowedTime = openDate + priorityLimit;  // Changed to include openDate
    const finalTimeState = totalAllowedTime - completedAt;
    
    // Calculate days using only the completion timestamp
    const daysElapsed = Math.floor((completedAt - openDate) / DAY_IN_MS);
    const daysLeft = Math.max(0, Math.floor(finalTimeState / DAY_IN_MS));

    // Format the completion time - this will now be consistent
    const completedTimeFormat = formatTimeRemaining(finalTimeState);

    return {
        formattedTime: completedTimeFormat,
        timeRemaining: {
            isDelayed: finalTimeState < 0,
            status: 'Completed',
            daysElapsed,
            daysLeft,
            totalDays: Math.floor(priorityLimit / DAY_IN_MS),
            priority: task.priority,
            delayDuration: finalTimeState < 0 ? Math.abs(finalTimeState) : 0,
            isFrozen: false,
            remainingTime: finalTimeState
        }
    };
}