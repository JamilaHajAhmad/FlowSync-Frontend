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
            console.log('Fetching KPI data...');
            const token = localStorage.getItem('authToken');
            
            // Log token structure (safely)
            console.log('Token parts:', token ? token.split('.').length : 0);
            
            if (!token) {
              setError('No authentication token found. Please log in.');
              setLoading(false);
              return;
            }

            // Validate token structure before making request
            if (token.split('.').length !== 3) {
              setError('Invalid token format. Please log in again.');
              setLoading(false);
              return;
            }

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

            // Check authentication first
            if (response.status === 401) {
              setError('Session expired. Please log in again.');
              localStorage.removeItem('authToken');
              return;
            }

            if (!response.data) {
              throw new Error('No data received from server');
            }

            // Log raw KPI value from response
            console.log('Raw KPI value:', response.data.kpi);

            // Process the data once
            const processedData = {
                totalCases: response.data.totalCases || 0,
                completed: response.data.completed || 0,
                delayed: response.data.delayed || 0,
                ongoing: response.data.ongoing || 0,
                kpi: response.data.kpi || 0
            };

            // Log processed KPI value
            console.log('Processed KPI value:', processedData.kpi);

            // Calculate progress once
            const progress = processedData.totalCases > 0 
                ? (processedData.completed / processedData.totalCases)
                : 0;

            const finalData = {
                ...processedData,
                progress: Math.min(progress, 1)
            };

            // Log final KPI value being set to state
            console.log('Final KPI value:', finalData.kpi);
            setKpiData(finalData);

        } catch (err) {
            console.error('Detailed error:', {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data
            });
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
          Overall Progress
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <StyledGaugeChart
            id="gauge-chart"
            nrOfLevels={3}
            colors={[colors.completed, colors.delayed, colors.ongoing]}
            arcWidth={0.3}
            // Fix 1: Ensure KPI value is between 0-1
            percent={Math.min(kpiData?.kpi || 0, 100) / 100}
            needleColor="#059669"
            textColor="#059669"
            // Fix 2: Ensure display value doesn't exceed 100%
            formatTextValue={value => `${Math.min(Math.round(kpiData?.kpi || 0), 100)}%`}
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