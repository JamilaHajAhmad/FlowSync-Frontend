import { Box, Typography, Card, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Grid, CircularProgress } from "@mui/material";
import { Schedule, CalendarToday, ErrorOutline, CheckCircleOutline } from "@mui/icons-material";
import { useState, useEffect } from "react";
import FreezeTaskForm from './FreezeTaskForm';
import { DndContext, DragOverlay, closestCorners, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import UnfreezeTaskForm from './UnfreezeTaskForm';
import CompleteTaskForm from './CompleteTaskForm';
import { useTaskTimer } from '../../../../hooks/useTaskTimer';
import { getMemberTasks } from '../../../../services/taskService';
import { toast } from 'react-toastify';
import React from 'react';

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

const TaskCard = ({ task, isDragging }) => {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: task.frnNumber.toString(),
    data: {
      type: 'task',
      task: task
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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

      {task.hasPendingFreezeRequest && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            label="Pending Freeze"
            sx={{
              backgroundColor: '#E3F2FD',
              color: '#1976D2',
              '& .MuiChip-label': {
                fontWeight: 500
              },
              borderRadius: '4px'
            }}
          />
          {task.freezeRequestedAt && (
            <Typography variant="caption" color="text.secondary">
              Requested: {new Date(task.freezeRequestedAt).toLocaleDateString()}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );

  const { formattedTime, timeRemaining } = useTaskTimer(task);

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

      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary">
          Time Remaining
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          color: timeRemaining.status === 'critical' ? '#d32f2f' : 
                timeRemaining.status === 'warning' ? '#ed6c02' : '#059669'
        }}>
          <Typography variant="h6">
            {`${formattedTime.days}d ${formattedTime.hours}h ${formattedTime.minutes}m ${formattedTime.seconds}s`}
          </Typography>
          {timeRemaining.isDelayed && (
            <ErrorOutline color="error" />
          )}
        </Box>
      </Grid>

      {task.hasPendingFreezeRequest && (
        <Grid item xs={12}>
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: '#E3F2FD', 
            borderRadius: 1,
            border: '1px solid #1976D2'
          }}>
            <Typography variant="subtitle2" color="#1976D2">
              Pending Freeze Request
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Requested on: {new Date(task.freezeRequestedAt).toLocaleString()}
            </Typography>
            {task.freezingReason && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                Reason: {task.freezingReason}
              </Typography>
            )}
          </Box>
        </Grid>
      )}
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

        <Box 
          onClick={() => setOpenDetailsDialog(true)}
          sx={{ 
            cursor: 'pointer',
            pr: 4
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

const DroppableColumn = ({ status, children }) => {
  const { setNodeRef } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status
    }
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        flex: 1,
        minWidth: '280px',
        backgroundColor: '#f5f5f5',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
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
          whiteSpace: 'nowrap',
        }}
      >
        {status} ({React.Children.count(children)})
      </Typography>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: 2,
          pb: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.15)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.25)',
            },
          },
          '@media (hover: none)': {
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

const Tasks = () => {
  const [tasksList, setTasksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [openFreezeDialog, setOpenFreezeDialog] = useState(false);
  const [openUnfreezeDialog, setOpenUnfreezeDialog] = useState(false);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  
  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          toast.error('Authentication token not found');
          return;
        }

        const taskPromises = [
          getMemberTasks(token, 'Opened'),
          getMemberTasks(token, 'Completed'),
          getMemberTasks(token, 'Delayed'),
          getMemberTasks(token, 'Frozen')
        ];

        const results = await Promise.all(taskPromises);
        
        const formatTasks = (tasks) => tasks.map(task => ({
          ...task,
          openDate: new Date(task.openDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }),
          completedDate: task.completedDate ? new Date(task.completedDate).toLocaleDateString('en-US') : null,
          frozenAt: task.frozenDate ? new Date(task.frozenDate).toLocaleDateString('en-US') : null,
          dayLefts: task.dayLefts || 0,
          daysDelayed: task.daysDelayed || 0,
          // Preserve the pending freeze state from the API response
          hasPendingFreezeRequest: task.hasPendingFreezeRequest,
          freezeRequestedAt: task.freezeRequestedAt,
          freezingReason: task.freezingReason
        }));

        const allTasks = [
          ...formatTasks(results[0].data).map(task => ({ ...task, status: 'Opened' })),
          ...formatTasks(results[1].data).map(task => ({ ...task, status: 'Completed' })),
          ...formatTasks(results[2].data).map(task => ({ ...task, status: 'Delayed' })),
          ...formatTasks(results[3].data).map(task => ({ ...task, status: 'Frozen' }))
        ];

        setTasksList(allTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchAllTasks();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 32px)' 
      }}>
        <CircularProgress sx={{ color: '#059669' }} />
      </Box>
    );
  }

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);

    const draggedTask = tasksList.find(task => task.frnNumber.toString() === active.id);
    if (draggedTask) {
      setSelectedTask(draggedTask);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
        setActiveId(null);
        return;
    }

    const activeTask = tasksList.find(task => task.frnNumber.toString() === active.id);
    
    // Get the status based on the drop target type
    const overStatus = over.data.current?.sortable ? 
        over.data.current.task.status : // For task-to-task drops
        over.data.current?.status || over.id; // For column drops

    console.log('Drag end:', { 
        activeTask, 
        fromStatus: activeTask?.status, 
        toStatus: overStatus,
        hasPendingFreeze: activeTask?.hasPendingFreezeRequest,
        dropType: over.data.current?.sortable ? 'task' : 'column'
    });

    if (!activeTask || activeTask.status === overStatus) {
        setActiveId(null);
        return;
    }

    if (!isMovementAllowed(activeTask.status, overStatus)) {
        toast.error('This movement is not allowed');
        setActiveId(null);
        return;
    }

    setSelectedTask(activeTask);
    setPendingStatusChange(overStatus);

    // Handle different status transitions
    if (activeTask.status === 'Opened' && overStatus === 'Frozen') {
        if (activeTask.hasPendingFreezeRequest) {
            toast.warning('This task already has a pending freeze request');
            setSelectedTask(null);
            setPendingStatusChange(null);
        } else {
            setOpenFreezeDialog(true);
        }
    } else if (activeTask.status === 'Frozen' && overStatus === 'Opened') {
        setOpenUnfreezeDialog(true);
    } else if (activeTask.status === 'Opened' && overStatus === 'Completed') {
        setOpenCompleteDialog(true);
    }

    setActiveId(null);
  };

  const handleTaskAction = async (action, task) => {
    if (!task) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      let success = false;
      let updatedTask = { ...task };

      switch (action) {
        case 'freeze':
          // Keep the task in Opened status with pending flag
          updatedTask = {
            ...task,
            status: 'Opened',
            hasPendingFreezeRequest: true,
            freezingReason: task.freezingReason,
            freezeRequestedAt: new Date().toISOString()
          };
          success = true;
          toast.info('Freeze request sent for approval');
          break;

        case 'unfreeze':
          updatedTask = {
            ...task,
            status: 'Opened',
            frozenAt: null,
            freezingReason: null,
            hasPendingFreezeRequest: false,
            freezeRequestedAt: null
          };
          success = true;
          toast.success('Task unfrozen successfully');
          break;

        case 'complete':
          updatedTask = {
            ...task,
            status: 'Completed',
            completedDate: new Date().toLocaleDateString('en-US'),
            completionNotes: task.completionNotes
          };
          success = true;
          toast.success('Task completed successfully');
          break;

        case 'updateStatus':
          updatedTask = {
            ...task,
            status: pendingStatusChange || task.status,
            ...(pendingStatusChange === 'Delayed' && {
              daysDelayed: task.dayLefts
            })
          };
          success = true;
          toast.info(`Task moved to ${pendingStatusChange || task.status}`);
          break;

        default:
          toast.error('Invalid action');
          break;
      }

      if (success) {
        const newTasks = tasksList.map(t => 
          t.frnNumber === task.frnNumber ? updatedTask : t
        );
        setTasksList(newTasks);

        // Reset states
        setSelectedTask(null);
        setPendingStatusChange(null);
        setOpenFreezeDialog(false);
        setOpenUnfreezeDialog(false);
        setOpenCompleteDialog(false);
      }
    } catch (error) {
      console.error('Error handling task action:', error);
      toast.error(error.response?.data?.message || 'Failed to update task');
      setPendingStatusChange(null);
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <Box
        sx={{
          height: 'calc(100vh - 32px)',
          display: 'flex',
          gap: 2,
          p: 2,
          overflowX: 'hidden',
          overflowY: 'hidden',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {statusColumns.map((status) => (
          <DroppableColumn key={status} status={status}>
            <SortableContext
              items={tasksList
                .filter((task) => task.status === status)
                .map((task) => task.frnNumber.toString())}
              strategy={verticalListSortingStrategy}
            >
              {tasksList
                .filter((task) => task.status === status)
                .map((task) => (
                  <TaskCard
                    key={task.frnNumber}
                    task={task}
                    isDragging={activeId === task.frnNumber.toString()}
                  />
                ))}
            </SortableContext>
          </DroppableColumn>
        ))}
      </Box>

      <DragOverlay>
        {activeId ? (
          <TaskCard
            task={tasksList.find(task => task.frnNumber.toString() === activeId)}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>

      {/* Forms */}
      <FreezeTaskForm
        open={openFreezeDialog}
        onClose={() => {
          setOpenFreezeDialog(false);
          setSelectedTask(null);
          setPendingStatusChange(null);
        }}
        task={selectedTask}
        onSubmitSuccess={(updatedTask) => handleTaskAction('freeze', updatedTask)}
      />

      <UnfreezeTaskForm
        open={openUnfreezeDialog}
        onClose={() => {
          setOpenUnfreezeDialog(false);
          setSelectedTask(null);
          setPendingStatusChange(null);
        }}
        task={selectedTask}
        onSubmitSuccess={(updatedTask) => handleTaskAction('unfreeze', updatedTask)}
      />

      <CompleteTaskForm
        open={openCompleteDialog}
        onClose={() => {
          setOpenCompleteDialog(false);
          setSelectedTask(null);
          setPendingStatusChange(null);
        }}
        task={selectedTask}
        onSubmitSuccess={(updatedTask) => handleTaskAction('complete', updatedTask)}
      />
    </DndContext>
  );
};

export default Tasks;