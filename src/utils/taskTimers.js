export const calculateTaskTimers = (task) => {
    const now = new Date().getTime();
    const openDate = new Date(task.createdAt).getTime();

    // Time counters in milliseconds
    const timeElapsed = now - openDate;
    const daysElapsed = Math.floor(timeElapsed / (1000 * 60 * 60 * 24));

    // Define limits based on priority
    const limits = {
        Regular: 7 * 24 * 60 * 60 * 1000,    // 7 days
        Important: 5 * 24 * 60 * 60 * 1000,  // 5 days
        Urgent: 1 * 24 * 60 * 60 * 1000      // 1 days
    };

    const threeHours = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

    const priorityLimit = limits[task.priority];
    const totalAllowedTime = openDate + priorityLimit + threeHours;
    const remainingTime = totalAllowedTime - now;

    // Calculate days left for open tasks
    let daysLeft = Math.round(remainingTime / (1000 * 60 * 60 * 24));
    
    const isDelayed = remainingTime < 0;
    const warningThreshold = priorityLimit * 0.5;
    const criticalThreshold = priorityLimit * 0.25;

    return {
        daysElapsed,
        daysLeft,
        timeElapsed,
        remainingTime,
        isDelayed,
        priority: task.priority,
        status: remainingTime > warningThreshold ? 'normal' :
                remainingTime > criticalThreshold ? 'warning' : 'critical',
        totalTime: priorityLimit
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