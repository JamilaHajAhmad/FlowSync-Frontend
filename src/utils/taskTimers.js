export const calculateTaskTimers = (task, timeOffset = 0) => {
    const now = new Date().getTime();
    const openDate = new Date(task.createdAt).getTime();
    
    const limits = {
        Regular: 15 * 60 * 1000,
        Important: 10 * 60 * 1000,
        Urgent: 1 * 60 * 1000
    };

    const priorityLimit = limits[task.priority];
    
    // Apply time offset for unfrozen tasks
    const effectiveNow = timeOffset ? (now - timeOffset) : now;
    const totalAllowedTime = openDate + priorityLimit;
    const remainingTime = totalAllowedTime - effectiveNow;

    return {
        remainingTime,
        isDelayed: remainingTime < 0,
        status: remainingTime < 0 ? 'Delayed' : 'normal',
        daysLeft: Math.max(0, Math.floor(remainingTime / (24 * 60 * 60 * 1000))),
        totalTime: priorityLimit,
        priority: task.priority
    };
};

export const formatTimeRemaining = (milliseconds) => {
    const absMs = Math.abs(milliseconds); 

    const seconds = Math.floor((absMs / 1000) % 60);
    const minutes = Math.floor((absMs / (1000 * 60)) % 60);
    const hours = Math.floor((absMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(absMs / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds };
};