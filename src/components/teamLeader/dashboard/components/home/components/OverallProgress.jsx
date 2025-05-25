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
import { decodeToken } from '../../../../../../utils'

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

export default function OverallProgress() {
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKPI = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const decodedToken = decodeToken(token);
        const leaderId = decodedToken.id;
        const response = await axios.get(
          `https://localhost:49798/api/kpi/leader/${leaderId}/annual-kpi`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log('KPI Data:', response.data);

        // Calculate progress (value between 0 and 1)
        const total = response.data.totalCases || 0;
        const completed = response.data.completed || 0;
        const progress = total > 0 ? completed / total : 0;

        setKpiData({
          ...response.data,
          progress: progress
        });
      } catch (err) {
        console.error('Error fetching KPI:', err);
        setError('Failed to load KPI data');
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
          Overall Progress
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <StyledGaugeChart
            id="gauge-chart"
            nrOfLevels={3}
            colors={[colors.completed, colors.delayed, colors.ongoing]}
            arcWidth={0.3}
            percent={kpiData.progress}
            needleColor="#059669"
            textColor="#059669"
          />
        </Box>
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, gap: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6">{kpiData.totalCases}</Typography>
            <Typography sx={{fontSize: 12 }} variant="body2" color="text.secondary">
              Total
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center'}}>
            <Typography variant="h6" color={colors.completed}>
              {kpiData.completed}
            </Typography>
            <Typography sx={{fontSize: 12 }} variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color={colors.delayed}>
              {kpiData.delayed}
            </Typography>
            <Typography sx={{fontSize: 12 }} variant="body2" color="text.secondary">
              Delayed
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color={colors.ongoing}>
              {kpiData.ongoing}
            </Typography>
            <Typography sx={{fontSize: 12 }} variant="body2" color="text.secondary">
              Ongoing
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </StyledCard>
  );
}