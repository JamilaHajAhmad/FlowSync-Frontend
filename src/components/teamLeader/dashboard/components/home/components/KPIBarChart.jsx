import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

export default function KPIBarChart() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState(null);
  const [previousKpi, setPreviousKpi] = useState(null);
  const [trend, setTrend] = useState(0);

  const colorPalette = [
    (theme.vars || theme).palette.primary.dark,
    (theme.vars || theme).palette.primary.main,
    (theme.vars || theme).palette.primary.light,
  ];

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          'https://localhost:49798/api/reports/leader/yearly-kpi',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const currentYearData = response.data[0];
        const currentKpi = currentYearData?.kpi;
        
        // Get the stored previous KPI from localStorage
        const storedPreviousKpi = localStorage.getItem('previousKpi');
        const storedPreviousKpiValue = storedPreviousKpi ? parseFloat(storedPreviousKpi) : null;
        
        // Get the stored current KPI (what we had before this fetch)
        const storedCurrentKpi = localStorage.getItem('currentKpi');
        const storedCurrentKpiValue = storedCurrentKpi ? parseFloat(storedCurrentKpi) : null;
        
        if (storedCurrentKpiValue === null) {
          // First time loading - no previous data exists
          localStorage.setItem('currentKpi', currentKpi.toString());
          setPreviousKpi(null);
        } else if (currentKpi !== storedCurrentKpiValue) {
          // KPI has changed - move current to previous, update current
          setPreviousKpi(storedCurrentKpiValue);
          localStorage.setItem('previousKpi', storedCurrentKpiValue.toString());
          localStorage.setItem('currentKpi', currentKpi.toString());
        } else {
          // KPI hasn't changed - keep existing previous value
          setPreviousKpi(storedPreviousKpiValue);
        }
        
        setKpiData(currentYearData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching KPI data:', error);
        setLoading(false);
      }
    };

    fetchKPIData();
  }, []);

  useEffect(() => {
    // Calculate trend whenever either KPI value changes
    if (kpiData?.kpi !== undefined && previousKpi !== undefined && previousKpi !== null) {
      const trendValue = ((kpiData.kpi - previousKpi) / previousKpi) * 100;
      setTrend(Math.round(trendValue));
    }
  }, [kpiData, previousKpi]);

  if (loading) {
    return (
      <Card variant="outlined" sx={{ width: '100%', minHeight: 250 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Yearly KPI Overview
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {kpiData?.kpi ? Math.round(kpiData.kpi) : '0'}%
            </Typography>
            {previousKpi !== null && (
              <Chip 
                size="small" 
                color={trend >= 0 ? "success" : "error"} 
                label={`${trend >= 0 ? '+' : ''}${trend}%`} 
              />
            )}
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Team KPI for {kpiData?.year || new Date().getFullYear()}
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'band',
              categoryGapRatio: 0.8,
              barGapRatio: 0.8,
              data: [kpiData?.year || new Date().getFullYear()],
            },
          ]}
          series={[
            {
              data: [kpiData?.kpi ? Math.ceil(kpiData.kpi) : 0],
              stack: 'A',
              label: 'KPI'
            }
          ]}
          height={250}
          margin={{ left: 50, right: 0, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        />
      </CardContent>
    </Card>
  );
}