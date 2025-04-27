import { useState, useEffect } from 'react';
import { calculateTaskTimers, formatTimeRemaining } from '../utils/taskTimers';

export const useTaskTimer = (task) => {
    const [ timeRemaining, setTimeRemaining ] = useState(calculateTaskTimers(task));
    const [ formattedTime, setFormattedTime ] = useState({});

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeRemaining = calculateTaskTimers(task);
            setTimeRemaining(newTimeRemaining);
            setFormattedTime(formatTimeRemaining(newTimeRemaining.remainingTime));
        }, 1000);

        return () => clearInterval(timer);
    }, [ task ]);

    return { timeRemaining, formattedTime };
};