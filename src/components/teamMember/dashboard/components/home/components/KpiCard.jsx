import * as React from 'react';
import GaugeChart from 'react-gauge-chart';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flexGrow: 1,
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  padding: theme.spacing(2),
}));

const StyledGaugeChart = styled(GaugeChart)(() => ({
  height: 200,
  width: '100%',
}));

const getColor = (value) => {
  if (value < 0.5) return '#FF0000'; // Red for values less than 50%
  if (value < 0.9) return '#F59E0B'; // Yellow for values between 50% and 90%
  return '#059669'; // Green for values 90% and above
};

const KpiCard = ({ title, value }) => {
  const percentage = value / 100;
  const color = getColor(percentage);

  return (
    <StyledCard variant="outlined">
      <CardContent>
        <Typography component="h2" variant="subtitle2" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <StyledGaugeChart
            id="gauge-chart"
            nrOfLevels={30}
            colors={[color, '#E0E0E0']} // Grey color for the remaining part
            arcWidth={0.3}
            percent={percentage}
            needleColor="#464A4F"
            textColor="#464A4F"
            formatTextValue={(value) => `${value}%`}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -10 }}>
          <Typography variant="body2" color="text.secondary">
            0%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            100%
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default KpiCard;