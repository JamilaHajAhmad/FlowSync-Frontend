import { Box, Typography, Card, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Grid } from "@mui/material";
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
    case "Opened":
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
    title: "Implement new feature",
    status: "Opened", 
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
    title: "Review client feedback",
    status: "Frozen", 
    frnNumber: "#124", 
    ossNumber: "OSS-002",
    openDate: "07.08.2024", 
    dayLefts: 10,
    priority: "Medium",
    frozenAt: "15.08.2024",
    freezingReason: "Waiting for client feedback"
  },
  { id: 3, title: "Fix bugs", status: "Delayed", frnNumber: "#125", openDate: "06.08.2024", dayLefts: 2 },
  { id: 4, title: "Release new version", status: "Completed", frnNumber: "#126", openDate: "05.08.2024", dayLefts: 0, completedDate: "10.08.2024" },
 
  

  { 
    id: 10, 
    title: "Implement new feature",
    status: "Opened", 
    frnNumber: "#123", 
    ossNumber: "OSS-001",
    openDate: "08.08.2024", 
    dayLefts: 5,
    priority: "High",
    progress: "75%",
    description: "Implement new feature"
  },
  
];

const statusColumns = ["Opened", "Frozen", "Delayed", "Completed"];

const isMovementAllowed = (source, destination) => {
  if (!source || !destination) return false;

  const invalidMoves = {
    'Opened': ['Delayed'],
    'Delayed': ['Opened', 'Frozen'],
    'Frozen': ['Completed', 'Delayed'],
    'Completed': ['Opened', 'Delayed', 'Frozen'],
  };

  return !invalidMoves[source]?.includes(destination);
};

const TaskCard = ({ task }) => {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  
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

  // Add renderCardInfo function
  const renderCardInfo = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {task.frnNumber}
        </Typography>
        {task.status === "Delayed" && (
          <ErrorOutline sx={{ color: "#d32f2f" }} />
        )}
        {task.status === "Completed" && (
          <CheckCircleOutline sx={{ color: "#059669" }} />
        )}
      </Box>
      
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        {task.title}
      </Typography>

      {task.ossNumber && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          OSS: {task.ossNumber}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {task.openDate}
          </Typography>
        </Box>
        {task.dayLefts > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Schedule sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {task.dayLefts} days left
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  // Add renderDialogContent function
  const renderDialogContent = () => (
    <Box sx={{ py: 1 }}>
      <Typography variant="h6" gutterBottom>
        {task.title}
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            FRN Number
          </Typography>
          <Typography variant="body1" gutterBottom>
            {task.frnNumber}
          </Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            OSS Number
          </Typography>
          <Typography variant="body1" gutterBottom>
            {task.ossNumber || 'N/A'}
          </Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Open Date
          </Typography>
          <Typography variant="body1" gutterBottom>
            {task.openDate}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Days Left
          </Typography>
          <Typography variant="body1" gutterBottom>
            {task.dayLefts}
          </Typography>
        </Grid>

        {task.status === "Completed" && (
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Completed At
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" gutterBottom>
                {task.completedDate}
              </Typography>
              <CheckCircleOutline sx={{ color: "#059669", fontSize: 20 }} />
            </Box>
          </Grid>
        )}

        {task.status === "Delayed" && (
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Days Delayed
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" gutterBottom color="#d32f2f">
                {task.daysDelayed} days
              </Typography>
              <ErrorOutline sx={{ color: "#d32f2f", fontSize: 20 }} />
            </Box>
          </Grid>
        )}

        {task.priority && (
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Priority
            </Typography>
            <Typography variant="body1" gutterBottom>
              {task.priority}
            </Typography>
          </Grid>
        )}
        
        {task.frozenAt && (
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Frozen At
            </Typography>
            <Typography variant="body1" gutterBottom>
              {task.frozenAt}
            </Typography>
          </Grid>
        )}
        
        {task.freezingReason && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Freezing Reason
            </Typography>
            <Typography variant="body1" gutterBottom>
              {task.freezingReason}
            </Typography>
          </Grid>
        )}
        
        {task.description && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1" gutterBottom>
              {task.description}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        sx={{
          p: 2,
          mb: 2,
          position: 'relative',
          borderLeft: `4px solid ${getStatusColor(task.status).color}`,
          '&:hover': { boxShadow: 3 }
        }}
      >
        {/* Drag Handle Area */}
        <Box
          {...attributes}
          {...listeners}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40px',
            height: '40px',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.04)',
              borderRadius: '0 4px 0 4px'
            }
          }}
        >
          ⋮⋮
        </Box>

        {/* Clickable Content Area */}
        <Box 
          onClick={() => setOpenDetailsDialog(true)}
          sx={{ 
            cursor: 'pointer',
            pr: 4 // Make space for drag handle
          }}
        >
          {renderCardInfo()}
        </Box>
      </Card>

      <Dialog 
        open={openDetailsDialog} 
        onClose={() => setOpenDetailsDialog(false)} 
        maxWidth="sm" 
        fullWidth
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle 
          sx={{ 
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: getStatusColor(task.status).background,
            color: getStatusColor(task.status).color
          }}
        >
          Task Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {renderDialogContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>
            Close
          </Button>
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

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);

    // Find and set the task being dragged
    const draggedTask = tasksList.find(task => task.id.toString() === active.id);
    if (draggedTask) {
      setSelectedTask(draggedTask);
    }
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

    // Only show action dialogs when dragging, not when clicking
    if (activeTask.status !== overContainer) {
      setPendingStatusChange(overContainer);

      if (overContainer === 'Frozen') {
        setSelectedTask(activeTask);
        setOpenFreezeDialog(true);
        return;
      }

      if (activeTask.status === 'Frozen' && overContainer === 'Opened') {
        setSelectedTask(activeTask);
        setOpenUnfreezeDialog(true);
        return;
      }

      if (overContainer === 'Completed') {
        setSelectedTask(activeTask);
        setOpenCompleteDialog(true);
        return;
      }

      // For other status changes
      handleTaskAction('updateStatus', { ...activeTask, status: overContainer });
    }
    
    setActiveId(null);
  };

  const handleTaskAction = (action, task) => {
    if (!task || !pendingStatusChange) return;

    const newTasks = tasksList.map(t => 
      t.id === task.id ? { ...t, status: pendingStatusChange } : t
    );
    setTasksList(newTasks);
    setPendingStatusChange(null);
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

