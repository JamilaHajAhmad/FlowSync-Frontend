import { useState, useEffect } from 'react';
import GaugeChart from 'react-gauge-chart';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';

const colors = {
  completed: '#059669',
  delayed: '#EF4444',
  opened: '#F59E0B',
  frozen: '#1976D2',
  gauge: {
    red: '#EF4444',
    orange: '#F59E0B',
    green: '#10B981'
  }
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

export default function KPI() {
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKPI = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
              `https://localhost:49798/api/kpi/leader/annual-kpi`,
              {
                  headers: { 
                      'Authorization': `Bearer ${token}`,
                      'Accept': 'application/json',
                      'Cache-Control': 'no-cache'
                  }
              }
            );

            // Log raw KPI value from response
            console.log('Raw KPI value:', response.data.kpi);
                        console.log('Raw KPI value:', response.data);


            // Process the data once
            const processedData = {
                totalTasks: response.data.totalTasks || 0,
                completedTasks: response.data.completedTasks || 0,
                delayedTasks: response.data.delayedTasks || 0,
                ongoingTasks: response.data.ongoingTasks || 0,
                frozenTasks: response.data.frozenTasks || 0,
                kpi: response.data.kpi || 0
            };

            // Log processed KPI value
            console.log('Processed KPI value:', processedData.kpi);

            // Calculate progress once
            const progress = processedData.totalTasks > 0 
                ? (processedData.completedTasks / processedData.totalTasks)
                : 0;

            const finalData = {
                ...processedData,
                progress: Math.min(progress, 1)
            };

            // Log final KPI value being set to state
            console.log('Final KPI value:', finalData.kpi);
            setKpiData(finalData);

        } catch (err) {
            console.error('Error fetching KPI data:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load KPI data');
        } finally {
            setLoading(false);
        }
    };

    fetchKPI();
  }, []);

  if (loading) {
    return (
      <StyledCard variant="outlined">
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress sx={{ color: colors.completed }} />
        </CardContent>
      </StyledCard>
    );
  }

  if (error) {
    return (
      <StyledCard variant="outlined">
        <CardContent>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard variant="outlined">
      <CardContent>
        <Typography component="h2" variant="subtitle2" sx={{ mb: 2 }}>
          KPI
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <StyledGaugeChart
            id="gauge-chart"
            nrOfLevels={3}
            colors={[colors.gauge.red, colors.gauge.orange, colors.gauge.green]}
            arcWidth={0.3}
            percent={Math.min(kpiData?.kpi || 0, 100) / 100}
            needleColor="#059669"
            textColor="#059669"
            formatTextValue={() => `${Math.min(Math.round(kpiData?.kpi || 0), 100)}%`}
          />
        </Box>
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, gap: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6">{kpiData.totalTasks}</Typography>
            <Typography sx={{fontSize: 12 }} variant="body2" color="text.secondary">
              Total
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center'}}>
            <Typography variant="h6" color={colors.opened}>
              {kpiData.ongoingTasks}
            </Typography>
            <Typography sx={{fontSize: 12 }} variant="body2" color="text.secondary">
              Opened
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color={colors.frozen}>
              {kpiData.frozenTasks}
            </Typography>
            <Typography sx={{fontSize: 12 }} variant="body2" color="text.secondary">
              Frozen
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color={colors.delayed}>
              {kpiData.delayedTasks}
            </Typography>
            <Typography sx={{fontSize: 12 }} variant="body2" color="text.secondary">
              Delayed
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color={colors.completed}>
              {kpiData.completedTasks}
            </Typography>
            <Typography sx={{fontSize: 12 }} variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </StyledCard>
  );
}