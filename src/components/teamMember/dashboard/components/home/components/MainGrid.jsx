import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import KpiCard from './KpiCard';
import TasksOverview from './TasksOverview';
import PageViewsBarChart from './PageViewsBarChart';
import SessionsChart from './SessionsChart';
import StatsCard from './StatsCard';
import TaskReminderCard from './TaskReminderCard';

const data = [
  {
    title: 'Users',
    value: '14k',
    interval: 'Last 30 days',
    trend: 'up',
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340, 380,
      360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
  },
  {
    title: 'Users',
    value: '14k',
    interval: 'Last 30 days',
    trend: 'up',
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340, 380,
      360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
  },
  {
    title: 'Conversions',
    value: '325',
    interval: 'Last 30 days',
    trend: 'down',
    data: [
      1640, 1250, 970, 1130, 1050, 900, 720, 1080, 900, 450, 920, 820, 840, 600, 820,
      780, 800, 760, 380, 740, 660, 620, 840, 500, 520, 480, 400,
    ],
  },
  {
    title: 'Event count',
    value: '200k',
    interval: 'Last 30 days',
    trend: 'neutral',
    data: [
      500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620, 510, 530,
      520, 410, 530, 520, 610, 530, 520, 610, 530, 420, 510, 430, 520, 510,
    ],
  },
];

export default function MainGrid() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {data.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatsCard {...card} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, md: 6 }}>
          <SessionsChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PageViewsBarChart />
        </Grid>
      </Grid>
      <Typography variant="h6" mb={2}>
        Task Reminders
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <TaskReminderCard />
      </Stack>
      <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
        <Grid item xs={12} md={6}>
          <TasksOverview />
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: (theme) => theme.spacing(19), ml: (theme) => theme.spacing(5) }}>
          <KpiCard title="KPI" value={72} />
        </Grid>
      </Grid>
    </Box>
  );
}