import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import KPI from './KPI';
import TasksOverview from './TasksOverview';
import KPIBarChart from './KPIBarChart';
import TasksChart from './TasksChart';
import StatsCard from './StatsCard';
import TaskReminderCard from './TaskReminderCard';

export default function MainGrid() {
  const taskTypes = ['Opened', 'Completed', 'Delayed', 'Frozen'];

  return (
    <Box className="main-grid-container">
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {taskTypes.map((type, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatsCard taskType={type} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, md: 6 }}>
          <TasksChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <KPIBarChart />
        </Grid>
      </Grid>
      <Typography variant="h6" mb={2}>
        Task Status Overview
      </Typography>
      <Stack
        direction="row"
        spacing={4}
        sx={{ mb: 2 }}
      >
        <TaskReminderCard />
      </Stack>
      <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
        <Grid item xs={12} md={6}>
          <TasksOverview />
        </Grid>
        <Grid item xs={12} md={6} sx={{ position: 'sticky', mt: 14, ml: 5 }}>
          <KPI />
        </Grid>
      </Grid>
    </Box>
  );
}