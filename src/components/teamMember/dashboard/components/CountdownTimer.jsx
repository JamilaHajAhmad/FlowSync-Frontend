import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const CountdownTimer = ({ deadline }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
    });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const deadlineTime = new Date(deadline).getTime();
            const difference = deadlineTime - now;

            if (difference <= 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
                milliseconds: difference % 1000
            });
        }, 100);

        return () => clearInterval(timer);
    }, [deadline]);

    return (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1 }}>
            <TimeUnit value={timeLeft.days} label="DAYS" />
            <TimeUnit value={timeLeft.hours} label="HOURS" />
            <TimeUnit value={timeLeft.minutes} label="MIN" />
            <TimeUnit value={timeLeft.seconds} label="SEC" />
            <TimeUnit 
                value={Math.floor(timeLeft.milliseconds / 100)} 
                label="MS" 
                isMilliseconds 
            />
        </Box>
    );
};

const TimeUnit = ({ value, label, isMilliseconds }) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderRadius: 1,
            p: 1,
            minWidth: isMilliseconds ? 40 : 60,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.1)'
        }}
    >
        <Typography
            variant="h6"
            sx={{
                fontWeight: 'bold',
                color: value === 0 ? 'text.disabled' : 'primary.main',
                fontFamily: 'monospace'
            }}
        >
            {isMilliseconds ? value : value.toString().padStart(2, '0')}
        </Typography>
        <Typography
            variant="caption"
            sx={{
                color: 'text.secondary',
                fontSize: '0.6rem',
                letterSpacing: '0.1em'
            }}
        >
            {label}
        </Typography>
    </Box>
);

export default CountdownTimer;