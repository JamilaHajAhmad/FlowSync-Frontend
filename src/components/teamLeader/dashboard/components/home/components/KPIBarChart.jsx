import { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Stack, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Tooltip, Box, Divider, Grid
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from 'axios';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

const InfoCard = ({ icon, title, value, subtitle, trend = null }) => (
  <Box sx={{
    p: 2.5,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    height: '100%',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    }
  }}>
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        {icon}
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'medium' }}>
          {value}
        </Typography>
        {trend !== null && (
          <Chip 
            size="small" 
            color={trend >= 0 ? "success" : "error"} 
            label={`${trend >= 0 ? '+' : ''}${trend}%`}
            sx={{ height: 24 }}
          />
        )}
      </Stack>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Stack>
  </Box>
);

export default function KPIBarChart() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState(null);
  const [previousKpi, setPreviousKpi] = useState(null);
  const [trend, setTrend] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  const KPIDetailsDialog = () => (
    <Dialog
      open={detailsOpen}
      onClose={() => setDetailsOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 2,
          maxWidth: 800
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5
      }}>
        <AssessmentIcon color="primary" />
        <Typography variant="h6">
          KPI Performance Analysis {kpiData?.year}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ p: 1 }}>
          {/* Main Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <InfoCard
                icon={<AssessmentIcon color="primary" />}
                title="Current KPI"
                value={`${kpiData?.kpi ? Math.round(kpiData.kpi) : '0'}%`}
                subtitle="Overall performance index"
                trend={trend}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoCard
                icon={<TimelineIcon color="success" />}
                title="Previous Record"
                value={previousKpi ? `${Math.round(previousKpi)}%` : 'N/A'}
                subtitle="Historical performance"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Performance Analysis */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Performance Insights
          </Typography>
          
          <Box sx={{
            bgcolor: 'background.default',
            p: 3,
            borderRadius: 2,
            mb: 3
          }}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TrendingUpIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Your current KPI stands at <strong>{kpiData?.kpi ? Math.round(kpiData.kpi) : '0'}%</strong>
                </Typography>
              </Stack>
              
              {previousKpi !== null && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <TimelineIcon color={trend >= 0 ? "success" : "error"} />
                  <Typography variant="body2" color="text.secondary">
                    Performance has {trend >= 0 ? 'improved' : 'decreased'} by <strong>{Math.abs(trend)}%</strong> compared to previous record
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" spacing={2} alignItems="center">
                <AssessmentIcon color="info" />
                <Typography variant="body2" color="text.secondary">
                  This metric represents your overall performance and task completion efficiency
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Visualization */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Visual Overview
          </Typography>
          <Box sx={{ height: 300, mb: 2 }}>
            <BarChart
              borderRadius={8}
              colors={colorPalette}
              xAxis={[{
                scaleType: 'band',
                data: [kpiData?.year],
                categoryGapRatio: 0.6,
              }]}
              series={[{
                data: [kpiData?.kpi ? Math.ceil(kpiData.kpi) : 0],
              }]}
              margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
              grid={{ horizontal: true }}
            />
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={() => setDetailsOpen(false)}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

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
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography component="h2" variant="subtitle2">
            Yearly KPI Overview
          </Typography>
          <Tooltip title="View KPI Analysis">
            <IconButton 
              size="small" 
              onClick={() => setDetailsOpen(true)}
              sx={{ color: theme.palette.text.secondary }}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </Stack>
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
            Member KPI for {kpiData?.year || new Date().getFullYear()}
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
        <KPIDetailsDialog />
      </CardContent>
    </Card>
  );
}