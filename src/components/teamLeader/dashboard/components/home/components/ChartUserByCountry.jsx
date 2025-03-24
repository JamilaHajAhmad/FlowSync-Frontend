import * as React from 'react';
import GaugeChart from 'react-gauge-chart';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

const data = {
  totalCases: 95,
  completed: 26,
  delayed: 35,
  ongoing: 35,
  progress: 0.72, // GaugeChart expects a value between 0 and 1
};

const colors = {
  completed: '#059669',
  delayed: '#F59E0B',
  ongoing: '#10B981',
};

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flexGrow: 1,
  backgroundColor: '#F0FDF4',
  borderRadius: '12px',
  padding: theme.spacing(2),
}));

const StyledGaugeChart = styled(GaugeChart)(() => ({
  height: 200,
  width: '100%',
}));

export default function ChartUserByCountry() {
  return (
    <StyledCard variant="outlined">
      <CardContent>
        <Typography component="h2" variant="subtitle2" sx={{ mb: 2 }}>
          Overall Progress
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <StyledGaugeChart
            id="gauge-chart"
            nrOfLevels={3}
            colors={[colors.completed, colors.delayed, colors.ongoing]}
            arcWidth={0.3}
            percent={data.progress}
            needleColor="#059669"
            textColor="#059669"
          />
        </Box>
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, gap: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6">{data.totalCases}</Typography>
            <Typography sx={{fontSize: 12 }} variant="body2" color="text.secondary">
              Total
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center'}}>
            <Typography variant="h6" color={colors.completed}>
              {data.completed}
            </Typography>
            <Typography  sx={{fontSize: 12 }}  variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color={colors.delayed}>
              {data.delayed}
            </Typography>
            <Typography  sx={{fontSize: 12 }}variant="body2" color="text.secondary">
              Delayed
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color={colors.ongoing}>
              {data.ongoing}
            </Typography>
            <Typography  sx={{fontSize: 12 }} variant="body2" color="text.secondary">
              Ongoing
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </StyledCard>
  );
}