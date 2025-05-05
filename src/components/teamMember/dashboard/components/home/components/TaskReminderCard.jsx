import React from "react";
import { Card, CardContent, Typography, Chip, Box } from "@mui/material";
import TaskIcon from "@mui/icons-material/Task";
import AcUnit from "@mui/icons-material/AcUnit";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const getStatusColor = (status) => {
  switch (status) {
    case "Ongoing":
      return { 
        color: "#fff4e0",  // Light orange background
        textColor: "orange", // Orange text
        icon: <TaskIcon sx={{ color: "#ed6c02" }} />,
        borderLeftColor: "#ed6c02"
      };
    case "Frozen":
      return { 
        color: "#E3F2FD",  // Light blue background
        textColor: "#1976D2", // Blue text
        icon: <AcUnit sx={{ color: "#1976D2" }} />,
        borderLeftColor: "#1976D2"
      };
    case "Delayed":
      return { 
        color: "#fde8e8",  // Light red background
        textColor: "red", // Red text
        icon: <ErrorOutlineIcon sx={{ color: "#d32f2f" }} />,
        borderLeftColor: "#d32f2f"
      };
    default:
      return { 
        color: "#ecfdf5",  // Light green background
        textColor: "#059669", // Green text
        icon: null,
        borderLeftColor: "#059669"
      };
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
        const { color, textColor, icon, borderLeftColor } = getStatusColor(task.status);
        return (
          <Card 
            key={index} 
            sx={{ 
              minWidth: 300, 
              borderLeft: `5px solid ${borderLeftColor}`, 
              mb: 2, 
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                {icon}
                <Typography variant="h6">{task.title}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {task.description}
              </Typography>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Chip 
                  label={task.status} 
                  sx={{ 
                    bgcolor: color,
                    color: textColor,
                    borderRadius: '16px'
                  }} 
                />
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