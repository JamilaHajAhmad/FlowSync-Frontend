import { Box, Typography, Card, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { MoreVert, Schedule, CalendarToday, ErrorOutline, CheckCircleOutline } from "@mui/icons-material";
import { useState } from "react";
import FreezeTaskForm from './FreezeTaskForm';

const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return { color: "green", background: "#e0f7e9" };
    case "Delayed":
      return { color: "red", background: "#fde8e8" };
    case "Ongoing":
      return { color: "orange", background: "#fff4e0" };
    case "Frozen":
      return { color: "#1976D2", background: "#E3F2FD" };
    default:
      return {};
  }
};

const rows = [
  { 
    id: 1, 
    status: "Ongoing", 
    frnNumber: "#123", 
    ossNumber: "OSS-001",
    openDate: "08.08.2024", 
    dayLefts: 5,
    priority: "High",
    progress: "75%",
    description: "Implement new feature"
  },
  { 
    id: 2, 
    status: "Frozen", 
    frnNumber: "#124", 
    ossNumber: "OSS-002",
    openDate: "07.08.2024", 
    dayLefts: 10,
    priority: "Medium",
    frozenAt: "15.08.2024",
    freezingReason: "Waiting for client feedback"
  },
  { id: 3, status: "Delayed", frnNumber: "#125", openDate: "06.08.2024", dayLefts: 2 },
  { id: 4, status: "Completed", frnNumber: "#126", openDate: "05.08.2024", dayLefts: 0, completedDate: "10.08.2024" }
];

const statusColumns = ["Ongoing", "Frozen", "Delayed", "Completed"];

const TaskCard = ({ task, onActionClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openFreezeDialog, setOpenFreezeDialog] = useState(false); // Add this state

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) {
      event.stopPropagation(); // Prevent card click when closing menu
    }
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action) => (event) => {
    event.stopPropagation(); // Prevent card click
    handleMenuClose();
    onActionClick(action, task);
  };

  const handleCardClick = () => setOpenDialog(true);

  const handleFreezeClick = (event) => {
    event.stopPropagation();
    handleMenuClose();
    setOpenFreezeDialog(true);
  };

  const renderCardInfo = () => {
    const cardContent = {
      "Ongoing": (
        <>
          <Typography variant="h6" gutterBottom>
            {task.frnNumber}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Opened: {task.openDate}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule fontSize="small" color="warning" />
              <Typography variant="body2" color="text.secondary">
                {task.dayLefts} days left
              </Typography>
            </Box>
          </Box>
        </>
      ),
      "Frozen": (
        <>
          <Typography variant="h6" gutterBottom>
            {task.frnNumber}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Opened: {task.openDate}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule fontSize="small" color="info" />
              <Typography variant="body2" color="text.secondary">
                Frozen at: {task.frozenAt}
              </Typography>
            </Box>
          </Box>
        </>
      ),
      "Delayed": (
        <>
          <Typography variant="h6" gutterBottom>
            {task.frnNumber}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Opened: {task.openDate}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorOutline fontSize="small" color="error" />
              <Typography variant="body2" color="error">
                Overdue by {Math.abs(task.dayLefts)} days
              </Typography>
            </Box>
          </Box>
        </>
      ),
      "Completed": (
        <>
          <Typography variant="h6" gutterBottom>
            {task.frnNumber}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Opened: {task.openDate}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleOutline fontSize="small" color="success" />
              <Typography variant="body2" color="success.main">
                Completed on: {task.completedDate}
              </Typography>
            </Box>
          </Box>
        </>
      )
    };
  
    return cardContent[task.status] || null;
  };

  // Detailed dialog content based on status
  const renderDialogContent = () => {
    switch (task.status) {
      case "Frozen":
        return (
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Typography><strong>Status:</strong> {task.status}</Typography>
            <Typography><strong>FRN Number:</strong> {task.frnNumber}</Typography>
            <Typography><strong>OSS Number:</strong> {task.ossNumber}</Typography>
            <Typography><strong>Priority:</strong> {task.priority}</Typography>
            <Typography><strong>Frozen At:</strong> {task.frozenAt}</Typography>
            <Typography><strong>Freezing Reason:</strong> {task.freezingReason}</Typography>
            <Typography><strong>Open Date:</strong> {task.openDate}</Typography>
          </Box>
        );

      case "Ongoing":
        return (
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Typography><strong>Status:</strong> {task.status}</Typography>
            <Typography><strong>FRN Number:</strong> {task.frnNumber}</Typography>
            <Typography><strong>OSS Number:</strong> {task.ossNumber}</Typography>
            <Typography><strong>Priority:</strong> {task.priority}</Typography>
            <Typography><strong>Open Date:</strong> {task.openDate}</Typography>
            <Typography><strong>Days Left:</strong> {task.dayLefts}</Typography>
          </Box>
        );

      case "Delayed":
        return (
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Typography><strong>Status:</strong> {task.status}</Typography>
            <Typography><strong>FRN Number:</strong> {task.frnNumber}</Typography>
            <Typography><strong>OSS Number:</strong> {task.ossNumber}</Typography>
            <Typography><strong>Priority:</strong> {task.priority}</Typography>
            <Typography><strong>Due Date:</strong> {task.openDate}</Typography>
            <Typography color="error">
              <strong>Overdue by:</strong> {Math.abs(task.dayLefts)} days
            </Typography>
          </Box>
        );

      case "Completed":
        return (
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Typography><strong>Status:</strong> {task.status}</Typography>
            <Typography><strong>FRN Number:</strong> {task.frnNumber}</Typography>
            <Typography><strong>OSS Number:</strong> {task.ossNumber}</Typography>
            <Typography><strong>Completed On:</strong> {task.completedDate}</Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        sx={{
          p: 2,
          mb: 2,
          cursor: 'pointer',
          '&:hover': { boxShadow: 3 },
          position: 'relative',
          borderLeft: `4px solid ${getStatusColor(task.status).color}`
        }}
      >
        {task.status !== "Completed" && (
          <IconButton
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={handleMenuOpen}
          >
            <MoreVert />
          </IconButton>
        )}

        {renderCardInfo()}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()} // Prevent card click when clicking menu
        >
          {(task.status === "Ongoing" || task.status === "Delayed") && (
            <MenuItem onClick={handleMenuItemClick('complete')}>
              Mark as Completed
            </MenuItem>
          )}
          {task.status === "Frozen" && (
            <MenuItem onClick={handleMenuItemClick('unfreeze')}>
              Unfreeze Task
            </MenuItem>
          )}
          {task.status !== "Frozen" && (
            <MenuItem onClick={handleFreezeClick}>
              Request Freeze
            </MenuItem>
          )}
        </Menu>

      </Card>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle 
          sx={{ 
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: getStatusColor(task.status).background,
            color: getStatusColor(task.status).color
          }}
        >
          Task Details - {task.frnNumber}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {renderDialogContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <FreezeTaskForm
        open={openFreezeDialog}
        onClose={() => setOpenFreezeDialog(false)}
        task={task}
      />
    </>
  );
};

const Tasks = () => {
  const handleTaskAction = (action, task) => {
    console.log(`${action} action for task`, task);
    // Implement action handling
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      gap: 2,
      p: 2,
    }}>
      {statusColumns.map(status => (
        <Box
          key={status}
          sx={{
            flex: 1, // Use flex: 1 to distribute space evenly
            minWidth: 0, // Allow the box to shrink below its content size
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
            p: 2,
            borderTop: `3px solid ${getStatusColor(status).color}`,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              color: getStatusColor(status).color,
              textAlign: 'center',
              fontWeight: 600,
              p: 1,
              borderRadius: '4px',
              whiteSpace: 'nowrap' // Prevent text wrapping
            }}
          >
            {status}
          </Typography>

          <Box sx={{ 
            overflow: 'auto',
            flex: 1, // Take remaining space
            maxHeight: 'calc(100vh - 200px)',
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#bbb',
              borderRadius: '3px'
            }
          }}>
            {rows
              .filter(task => task.status === status)
              .map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onActionClick={handleTaskAction}
                />
              ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default Tasks;

