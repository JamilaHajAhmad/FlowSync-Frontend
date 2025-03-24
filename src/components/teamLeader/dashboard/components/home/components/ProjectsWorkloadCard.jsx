import * as React from 'react';
import { Card, CardContent, Typography, Box, Stack, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';

const data = [
    { name: 'Sam', workload: 7 },
    { name: 'Maddy', workload: 6 },
    { name: 'Ken', workload: 2 },
    { name: 'Dmitry', workload: 10 },
];

const StyledCard = styled(Card)(({ theme }) => ({
    backgroundColor: '#F0FDF4',
    borderRadius: '12px',
    padding: theme.spacing(2),
}));

const Circle = styled(Box)(({ theme, size, color }) => ({
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: theme.spacing(0.5),
}));

const ProjectsWorkloadCard = () => {
    const [ timeframe, setTimeframe ] = React.useState('Last 2 months');

    const handleChange = (event) => {
        setTimeframe(event.target.value);
    };

    return (
        <StyledCard variant="outlined">
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography component="h2" variant="subtitle2">
                        Workload
                    </Typography>
                    <Select
                        value={timeframe}
                        onChange={handleChange}
                        variant="outlined"
                        size="small"
                        sx={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '0.875rem' }}
                    >
                        <MenuItem value="Last 2 months">Last 2 months</MenuItem>
                        <MenuItem value="Last 6 months">Last 6 months</MenuItem>
                        <MenuItem value="Last year">Last year</MenuItem>
                    </Select>
                </Box>
                <Stack direction="row" justifyContent="space-around" alignItems="flex-end">
                    {data.map((item, index) => (
                        <Box key={index} sx={{ textAlign: 'center' }}>
                            <Stack direction="column" alignItems="center">
                                {[ ...Array(item.workload) ].map((_, i) => (
                                    <Circle key={i} size={30} color={item.workload >= 10 ? '#059669' : '#000'}>
                                        {i === 0 ? item.workload : ''}
                                    </Circle>
                                ))}
                            </Stack>
                            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
                                {item.name}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </CardContent>
        </StyledCard>
    );
};

export default ProjectsWorkloadCard;
