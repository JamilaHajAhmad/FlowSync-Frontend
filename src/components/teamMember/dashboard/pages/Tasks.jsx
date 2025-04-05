import { Box, Typography, Card, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { Schedule, CalendarToday, ErrorOutline, CheckCircleOutline } from "@mui/icons-material";
import { useState } from "react";
import FreezeTaskForm from './FreezeTaskForm';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import UnfreezeTaskForm from './UnfreezeTaskForm';
import CompleteTaskForm from './CompleteTaskForm';

const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return { color: "#059669", background: "#e0f7e9" };
    case "Delayed":
      return { color: "#d32f2f", background: "#fde8e8" };
    case "Ongoing":
      return { color: "#ed6c02", background: "#fff4e0" };
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
  { id: 4, status: "Completed", frnNumber: "#126", openDate: "05.08.2024", dayLefts: 0, completedDate: "10.08.2024" },
 
  

  { 
    id: 10, 
    status: "Ongoing", 
    frnNumber: "#123", 
    ossNumber: "OSS-001",
    openDate: "08.08.2024", 
    dayLefts: 5,
    priority: "High",
    progress: "75%",
    description: "Implement new feature"
  },
  
];

const statusColumns = ["Ongoing", "Frozen", "Delayed", "Completed"];

const isMovementAllowed = (source, destination) => {
  if (!source || !destination) return false;

  const invalidMoves = {
    'Ongoing': ['Delayed'],
    'Delayed': ['Ongoing',],
    'Frozen': ['Completed', 'Delayed'],
    'Completed': ['Ongoing', 'Delayed', 'Frozen'],
  };

  return !invalidMoves[source]?.includes(destination);
};

const TaskCard = ({ task }) => {
  const [openDialog, setOpenDialog] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    >
      <Card
        onClick={() => setOpenDialog(true)}
        sx={{
          p: 2,
          mb: 2,
          cursor: 'grab',
          '&:hover': { boxShadow: 3 },
          position: 'relative',
          borderLeft: `4px solid ${getStatusColor(task.status).color}`
        }}
      >
        {renderCardInfo()}
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
    </div>
  );
};

const Tasks = () => {
  const [tasksList, setTasksList] = useState(rows);
  const [activeId, setActiveId] = useState(null);
  const [openFreezeDialog, setOpenFreezeDialog] = useState(false);
  const [openUnfreezeDialog, setOpenUnfreezeDialog] = useState(false);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  const handleTaskAction = (action, task) => {
    console.log(`${action} action for task`, task);
    // Implement action handling logic here
    const newTasks = tasksList.map(t => 
      t.id === task.id ? { ...t, status: pendingStatusChange } : t
    );
    setTasksList(newTasks);
    setPendingStatusChange(null);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeTask = tasksList.find(task => task.id.toString() === active.id);
    const overContainer = over.data.current?.sortable?.containerId || over.id;

    // Check if movement is allowed
    if (!isMovementAllowed(activeTask.status, overContainer)) {
      return;
    }

    const updatedTask = { ...activeTask };
    setPendingStatusChange(overContainer);

    // Handle different status changes
    if (overContainer === 'Frozen') {
      setSelectedTask(updatedTask);
      setOpenFreezeDialog(true);
      return;
    }

    if (activeTask.status === 'Frozen' && overContainer === 'Ongoing') {
      setSelectedTask(updatedTask);
      setOpenUnfreezeDialog(true);
      return;
    }

    if (overContainer === 'Completed') {
      setSelectedTask(updatedTask);
      setOpenCompleteDialog(true);
      return;
    }

    // For other status changes
    handleTaskAction('updateStatus', { ...updatedTask, status: overContainer });
    setActiveId(null);
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <Box
        sx={{
          height: 'calc(100vh - 32px)', // Full page height minus padding
          display: 'flex',
          gap: 2,
          p: 2,
          overflowX: 'hidden', // Prevent horizontal scrolling
          overflowY: 'hidden', // Prevent outer vertical scrolling
          width: '100%', // Ensure full width of the container
          boxSizing: 'border-box', // Include padding and border in the element's total width and height
        }}
      >
        {statusColumns.map((status) => (
          <Box
            key={status}
            sx={{
              flex: 1,
              minWidth: '280px', // Minimum column width
              maxWidth: '1fr', // Allow columns to shrink and fit within the container
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%', // Full height of the container
              overflow: 'hidden', // Prevent any internal overflow
              borderTop: `3px solid ${getStatusColor(status).color}`,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                p: 2,
                color: getStatusColor(status).color,
                textAlign: 'center',
                fontWeight: 600,
                borderRadius: '4px',
                whiteSpace: 'nowrap', // Prevent text from wrapping or overflowing horizontally
              }}
            >
              {status}
            </Typography>

            <Box
              sx={{
                flex: 1,
                overflowY: 'auto', // Allow vertical scrolling only
                overflowX: 'hidden', // Prevent horizontal scrolling
                px: 2,
                pb: 2,
                '&::-webkit-scrollbar': {
                  width: '8px', // Scrollbar width
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0,0,0,0.05)', // Scrollbar track color
                  borderRadius: '4px', // Rounded scrollbar track
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.15)', // Scrollbar thumb color
                  borderRadius: '4px', // Rounded scrollbar thumb
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.25)', // Darker color on hover
                  },
                },
                '@media (hover: none)': {
                  '&::-webkit-scrollbar': {
                    display: 'none', // Hide scrollbar on touch devices
                  },
                },
              }}
            >
              <SortableContext
                items={tasksList
                  .filter((task) => task.status === status)
                  .map((task) => task.id.toString())}
                strategy={verticalListSortingStrategy}
                id={status}
              >
                {tasksList
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isDragging={activeId === task.id.toString()}
                    />
                  ))}
              </SortableContext>
            </Box>
          </Box>
        ))}
      </Box>

      <DragOverlay>
        {activeId ? (
          <TaskCard
            task={tasksList.find(task => task.id.toString() === activeId)}
            isDragging={false} // Set to false to prevent opacity change
          />
        ) : null}
      </DragOverlay>

      <FreezeTaskForm
        open={openFreezeDialog}
        onClose={() => {
          setOpenFreezeDialog(false);
          setSelectedTask(null);
          setPendingStatusChange(null);
        }}
        task={selectedTask}
        onConfirm={(task) => {
          handleTaskAction('freeze', task);
          setOpenFreezeDialog(false);
          setSelectedTask(null);
        }}
      />

      <UnfreezeTaskForm
        open={openUnfreezeDialog}
        onClose={() => {
          setOpenUnfreezeDialog(false);
          setSelectedTask(null);
          setPendingStatusChange(null);
        }}
        task={selectedTask}
        onConfirm={(task) => {
          handleTaskAction('unfreeze', task);
          setOpenUnfreezeDialog(false);
          setSelectedTask(null);
        }}
      />

      <CompleteTaskForm
        open={openCompleteDialog}
        onClose={() => {
          setOpenCompleteDialog(false);
          setSelectedTask(null);
          setPendingStatusChange(null);
        }}
        task={selectedTask}
        onConfirm={(task) => {
          handleTaskAction('complete', task);
          setOpenCompleteDialog(false);
          setSelectedTask(null);
        }}
      />
    </DndContext>
  );
};

export default Tasks;

