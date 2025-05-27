import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import GaugeChart from 'react-gauge-chart';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

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

const colors = {
  gauge: {
    red: '#EF4444',    // Low performance
    orange: '#F59E0B', // Medium performance
    green: '#10B981'   // High performance
  }
};

const getColor = (value) => {
  if (value < 0.34) return colors.gauge.red;
  if (value < 0.67) return colors.gauge.orange;
  return colors.gauge.green;
};

const KpiCard = ({ title }) => {
  const [kpiData, setKpiData] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKPI = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(
          'https://localhost:49798/api/kpi/member/annual-kpi',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            }
          }
        );

        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }

        const kpiValue = response.data?.kpi || 0;
        console.log('KPI Value:', kpiValue);
        setKpiData(kpiValue);

      } catch (err) {
        console.error('Error fetching KPI:', err);
        setError(err.message || 'Failed to load KPI data');
      } finally {
        setLoading(false);
      }
    };

    fetchKPI();
  }, []);

  const percentage = kpiData / 100;

  if (loading) {
    return (
      <StyledCard variant="outlined">
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress sx={{ color: '#059669' }} />
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
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <StyledGaugeChart
            id="gauge-chart"
            nrOfLevels={3}
            colors={[
              colors.gauge.red,     // Left segment (Red)
              colors.gauge.orange,  // Middle segment (Orange) 
              colors.gauge.green    // Right segment (Green)
            ]}
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