import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import KPI from './KPI';
import Members from '../../../pages/Members';
import KPIBarChart from './KPIBarChart';
import TasksChart from './TasksChart';
import StatsCard from './StatsCard';
import Tasks from '../../../pages/Tasks';

export default function MainGrid() {
  const taskTypes = [ 'Opened', 'Completed', 'Delayed', 'Frozen' ];
  return (
    <Box className="main-grid-container">
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
        {
          taskTypes.map((type, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatsCard taskType={type} />
            </Grid>
          ))
        }
      </Grid>

      <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
        <Grid item xs={12} md={8} sx={{ 
              mb: (theme) => theme.spacing(15),
              mt: (theme) => theme.spacing(2)
          }}>
          <Tasks
            hideCreateButton={true}
            showTabs={true}
            containerWidth="88.5vw"
            tabsAlignment="right"
            showTitle={true}
            showToolbarBorder={true}
            hideFilterToolbar={true}
          />
        </Grid>
      </Grid>

      {/* Add a new container for charts with top margin */}
      <Grid 
          container 
          spacing={2} 
          columns={12} 
          sx={{ 
              mb: (theme) => theme.spacing(2),
              mt: (theme) => theme.spacing(3) // Add top margin
          }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <TasksChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <KPIBarChart />
        </Grid>
      </Grid>

      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Team Members
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <Members showActions={false} />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
            <KPI />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}