export const calculateTaskTimers = (task) => {
    const now = new Date();
    const openDate = new Date(task.openDate);

    // Time counters in milliseconds
    const timeElapsed = now - openDate;
    const daysElapsed = Math.floor(timeElapsed / (1000 * 60 * 60 * 24));

    // Define limits based on priority
    const limits = {
        Regular: 7 * 24 * 60 * 60 * 1000,    // 7 days
        Important: 5 * 24 * 60 * 60 * 1000,  // 5 days
        Urgant: 2 * 24 * 60 * 60 * 1000      // 2 days
    };

    // Get limit based on task priority
    const priorityLimit = limits[ task.priority ] || limits.Regular;

    // Calculate remaining time based on priority
    const remainingTime = priorityLimit - timeElapsed;
    const isDelayed = remainingTime < 0;

    // Calculate status thresholds based on priority
    const warningThreshold = priorityLimit * 0.5;  // 50% of time remaining
    const criticalThreshold = priorityLimit * 0.25; // 25% of time remaining

    return {
        daysElapsed,
        remainingTime,
        isDelayed,
        priority: task.priority,
        status: remainingTime > warningThreshold ? 'normal' :
            remainingTime > criticalThreshold ? 'warning' : 'critical',
        totalTime: priorityLimit
    };
};

export const formatTimeRemaining = (milliseconds) => {
    if (milliseconds < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds };
};