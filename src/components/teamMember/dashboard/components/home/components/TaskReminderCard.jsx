import React from "react";
import { Card, CardContent, Typography, Chip, Box } from "@mui/material";
import TaskIcon from "@mui/icons-material/Task";
import AcUnit from "@mui/icons-material/AcUnit";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const getStatusColor = (status) => {
  switch (status) {
    case "Ongoing":
      return { color: "orange", icon: <TaskIcon /> };
    case "Frozen":
      return { color: "blue", icon: <AcUnit /> };
    case "Delayed":
      return { color: "red", icon: <ErrorOutlineIcon /> };
    default:
      return { color: "black", icon: null };
  }
};

const tasks = [
  {
    title: "Develop Feature X",
    description: "Implement and test the new feature.",
    status: "Ongoing",
    dueDate: "March 28, 2025",
  },
  {
    title: "Server Migration",
    description: "Move services to the new cloud provider.",
    status: "Frozen",
    dueDate: "April 5, 2025",
  },
  {
    title: "Finalize Report",
    description: "Submit the monthly performance report.",
    status: "Delayed",
    dueDate: "March 20, 2025",
  },
  {
    title: "Finalize Report",
    description: "Submit the monthly performance report.",
    status: "Delayed",
    dueDate: "March 20, 2025",
  },
];


const TaskReminderCard = () => {
  return (
    <>
      {tasks.map((task, index) => {
        const { color, icon } = getStatusColor(task.status);
        return (
          <Card key={index} sx={{ maxWidth: 400, borderLeft: `5px solid ${color}`, mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                {icon}
                <Typography variant="h6">{task.title}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {task.description}
              </Typography>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Chip label={task.status} sx={{ bgcolor: color, color: "white" }} />
                <Typography variant="body2">Due: {task.dueDate}</Typography>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
};

export default TaskReminderCard;