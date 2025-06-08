import { Typography } from '@mui/material';

const CountdownTimer = ({ counter, isOverdue = false }) => {
    const parseCounter = (counterStr) => {
        if (!counterStr) {
            return {
                days: 0,
                hours: 0,
                minutes: 0
            };
        }

        try {
            // Handle negative values for overdue tasks
            const isNegative = counterStr.startsWith('-');
            const cleanCounter = counterStr.replace('-', '');
            
            const [dayPart, timePart] = cleanCounter.split('.');
            const [hours, minutes] = timePart.split(':');

            const values = {
                days: parseInt(dayPart, 10),
                hours: parseInt(hours, 10),
                minutes: parseInt(minutes, 10)
            };

            // If overdue, make values negative
            if (isNegative) {
                values.days = -values.days;
                values.hours = -values.hours;
                values.minutes = -values.minutes;
            }

            return values;
        } catch (error) {
            console.error('Error parsing counter:', error, counterStr);
            return {
                days: 0,
                hours: 0,
                minutes: 0
            };
        }
    };

    const { days, hours, minutes } = parseCounter(counter);

    const formatTimeRemaining = (days, hours, minutes) => {
        if (!counter) return 'Counter not available';

        const parts = [];
        const absDays = Math.abs(days);
        const absHours = Math.abs(hours);
        const absMinutes = Math.abs(minutes);
        
        if (absDays > 0) {
            parts.push(`${absDays} ${absDays === 1 ? 'day' : 'days'}`);
        }
        if (absHours > 0) {
            parts.push(`${absHours} ${absHours === 1 ? 'hour' : 'hours'}`);
        }
        if (absMinutes > 0) {
            parts.push(`${absMinutes} ${absMinutes === 1 ? 'minute' : 'minutes'}`);
        }

        return parts.join(' ') || 'Less than a minute';
    };

    return (
        <Typography
            sx={{
                color: isOverdue ? '#d32f2f' : 'text.primary',
            }}
        >
            {formatTimeRemaining(days, hours, minutes)}
        </Typography>
    );
};

export default CountdownTimer;