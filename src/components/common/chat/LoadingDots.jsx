import React from 'react';
import { Box } from '@mui/material';

const LoadingDots = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                gap: '4px',
                padding: '10px',
            }}
        >
            {[0, 1, 2].map((index) => (
                <Box
                    key={index}
                    sx={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#059669',
                        borderRadius: '50%',
                        animation: 'dotBounce 1s infinite',
                        animationDelay: `${index * 0.2}s`,
                        '@keyframes dotBounce': {
                            '0%, 100%': {
                                transform: 'translateY(0)',
                            },
                            '50%': {
                                transform: 'translateY(-10px)',
                            },
                        },
                    }}
                />
            ))}
        </Box>
    );
};

export default LoadingDots;