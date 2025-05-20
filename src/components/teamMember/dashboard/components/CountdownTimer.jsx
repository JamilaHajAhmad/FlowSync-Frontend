import { Typography } from '@mui/material';

const CountdownTimer = ({ counter }) => {
    const parseCounter = (counterStr) => {
        if (!counterStr) {
            return {
                days: 0,
                hours: 0,
                minutes: 0
            };
        }

        try {
            const [dayPart, timePart] = counterStr.split('.');
            const [hours, minutes] = timePart.split(':');

            return {
                days: parseInt(dayPart, 10),
                hours: parseInt(hours, 10),
                minutes: parseInt(minutes, 10)
            };
        } catch (error) {
            console.error('Error parsing counter:', error);
            return {
                days: 0,
                hours: 0,
                minutes: 0
            };
        }
    };

    const { days, hours, minutes } = parseCounter(counter);

    const formatTimeRemaining = (days, hours, minutes) => {
        if (!counter) {
            return 'Counter not available';
        }

        const parts = [];
        
        if (days > 0) {
            parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
        }
        if (hours > 0) {
            parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
        }
        if (minutes > 0) {
            parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
        }

        return parts.join(' ') || 'Less than a minute';
    };

    return (
        <Typography
            sx={{
                color: counter ? 'text.primary' : 'text.secondary',
                fontFamily: 'system-ui'
            }}
        >
            {formatTimeRemaining(days, hours, minutes)}
        </Typography>
    );
};

export default CountdownTimer;