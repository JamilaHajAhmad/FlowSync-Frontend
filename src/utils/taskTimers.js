export const calculateTaskTimers = (task, timeOffset = 0) => {
    const now = new Date().getTime();
    const openDate = new Date(task.createdAt).getTime();
    
    const limits = {
        Regular: 15 * 60 * 1000,
        Important: 10 * 60 * 1000,
        Urgent: 1 * 60 * 1000
    };

    const priorityLimit = limits[task.priority];
    
    // Adjust current time by subtracting the frozen duration
    const effectiveNow = timeOffset ? (now - timeOffset) : now;
    
    // Calculate remaining time with offset
    const timeElapsed = effectiveNow - openDate;
    const remainingTime = priorityLimit - timeElapsed;
    
    const warningThreshold = priorityLimit * 0.5;
    const criticalThreshold = priorityLimit * 0.25;

    return {
        remainingTime,
        isDelayed: remainingTime < 0,
        daysLeft: Math.max(0, Math.floor(remainingTime / (24 * 60 * 60 * 1000))),
        totalTime: priorityLimit,
        priority: task.priority,
        status: remainingTime > warningThreshold ? 'normal' :
                remainingTime > criticalThreshold ? 'warning' : 'critical'
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