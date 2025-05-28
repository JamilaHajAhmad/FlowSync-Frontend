import { Box, Typography, Card, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, CircularProgress } from "@mui/material";
import { CalendarToday, ErrorOutline, CheckCircleOutline, PauseCircleOutline } from "@mui/icons-material";
import { useState, useEffect } from "react";
import FreezeTaskForm from './FreezeTaskForm';
import { DndContext, DragOverlay, closestCorners, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import UnfreezeTaskForm from './UnfreezeTaskForm';
import CompleteTaskForm from './CompleteTaskForm';
import { getMemberTasks } from '../../../../services/taskService';
import { toast } from 'react-toastify';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import CountdownTimer from '../components/CountdownTimer';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ReactPlayer from 'react-player';

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

const statusColumns = [ "Opened", "Frozen", "Delayed", "Completed" ];

const isMovementAllowed = (source, destination) => {
  if (!source || !destination) return false;

  const invalidMoves = {
    'Opened': [ 'Delayed' ],
    'Delayed': [ 'Opened', 'Frozen' ],
    'Frozen': [ 'Completed', 'Delayed' ],
    'Completed': [ 'Opened', 'Delayed', 'Frozen' ],
  };

  return !invalidMoves[ source ]?.includes(destination);
};

const TaskCard = ({ task, isDragging }) => {
  const [ openDetailsDialog, setOpenDetailsDialog ] = useState(false);

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

  const renderCardInfo = () => {
    return (
      <Box>
        {/* Existing title and status icon */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            {task.taskTitle}
          </Typography>
          {task.status === "Delayed" && (
            <ErrorOutline sx={{ color: "#d32f2f" }} />
          )}
          {task.status === "Completed" && (
            <CheckCircleOutline sx={{ color: "#059669" }} />
          )}
          {task.status === "Frozen" && (
            <PauseCircleOutline sx={{ color: "#1976D2" }} />
          )}
          {task.status === "Opened" && (
            <RotateLeftIcon sx={{ color: "#ed6c02" }} />
          )}
        </Box>

        <Typography variant="body2">
          FRN: {task.frnNumber}
        </Typography>

        {task.ossNumber && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            OSS: {task.ossNumber}
          </Typography>
        )}

        {/* Status-specific information */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          {/* For Opened tasks */}
          {task.status === "Opened" && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: '#ed6c02' }} />
              <Typography variant="body2" color="text.secondary">
                Opened: {new Date(task.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  day: '2-digit',
                  month: '2-digit',
                })}
              </Typography>
            </Box>
          )}

          {/* For Delayed tasks - show overdue timer */}
          {task.status === "Delayed" && task.counter && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              whiteSpace: 'nowrap' // Prevent line breaks
            }}>
              <ErrorOutline sx={{ 
                fontSize: 16, 
                mr: 0.5, 
                color: '#d32f2f' 
              }} />
              <Typography 
                variant="body2" 
                component="div" 
                sx={{ 
                  color: '#d32f2f',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Overdue By:
                <span style={{ marginLeft: '4px' }}>
                  <CountdownTimer 
                    counter={task.counter} 
                    isOverdue={true}
                    format={(value, unit) => {
                      switch(unit) {
                        case 'days': return `${value}D`;
                        case 'hours': return `${value}H`;
                        case 'minutes': return `${value}M`;
                        default: return value;
                      }
                    }}
                  />
                </span>
              </Typography>
            </Box>
          )}

          {/* For Frozen tasks */}
          {task.status === "Frozen" && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PauseCircleOutline sx={{ fontSize: 16, mr: 0.5, color: '#1976D2' }} />
              <Typography variant="body2" color="text.secondary">
                Frozen at: {new Date(task.frozenAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  day: '2-digit',
                  month: '2-digit',
                })}
              </Typography>
            </Box>
          )}

          {/* For Completed tasks */}
          {task.status === "Completed" && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleOutline sx={{ fontSize: 16, mr: 0.5, color: '#059669' }} />
              <Typography variant="body2" color="text.secondary">
                Completed: {new Date(task.completedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  day: '2-digit',
                  month: '2-digit',
                })}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const renderDialogContent = () => (
    <Box sx={{ py: 1 }}>
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
            {new Date(task.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })
            }
          </Typography>
        </Grid>

        {task.completedAt && (
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Completed At
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" gutterBottom>
                {new Date(task.completedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  day: '2-digit',
                  month: '2-digit',
                })}
              </Typography>
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
          <>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Frozen At
              </Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(task.frozenAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  day: '2-digit',
                  month: '2-digit',
                })}
              </Typography>
            </Grid>

            {/* Move reason to be beside frozenAt */}
            {task.reason && (
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Freezing Reason
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {task.reason}
                </Typography>
              </Grid>
            )}
          </>
        )}

        {/* Move Counter section to be on the same row as Deadline */}
        {task.counter && task.status != 'Completed' && (
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              {task.status === "Delayed" ? "Overdue By" : "Time Remaining"}
            </Typography>
            <Typography 
              variant="body1" 
              gutterBottom
              sx={{ 
                color: task.status === "Delayed" ? "#d32f2f" : "inherit"
              }}
            >
              <CountdownTimer 
                counter={task.counter} 
                isOverdue={task.status === "Delayed"} 
              />
            </Typography>
          </Grid>
        )}

        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Deadline
          </Typography>
          <Typography variant="body1" gutterBottom>
            {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'No deadline set'}
          </Typography>
        </Grid>
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
          {task.taskTitle} Details
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
        {status}
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

const DragDropHelpDialog = ({ open, onClose }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f5f5f5'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HelpOutlineIcon />
          <Typography variant="h6">Task Board Help Guide</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>Drag and Drop Rules:</Typography>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>• Tasks can be dragged between columns based on these rules:</Typography>
          <Box sx={{ pl: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              - Opened tasks can be moved to Frozen or Completed
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              - Frozen tasks can only be moved back to Opened
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              - Delayed tasks can only be moved to Completed
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              - Completed tasks cannot be moved
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="h6" gutterBottom>How to Use:</Typography>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            1. Click and hold the drag handle (⋮⋮) on any task card
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            2. Drag the task to the desired column
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            3. Complete any required forms when prompted
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Demo Video:</Typography>
        <Box sx={{ 
          position: 'relative',
          paddingTop: '56.25%', // 16:9 aspect ratio
          backgroundColor: '#f5f5f5',
          borderRadius: 1,
          overflow: 'hidden',
          mb: 2
        }}>
          <ReactPlayer
            url="/videos/drag-drop-demo.mp4" // Update path to start from public folder
            width="100%"
            height="100%"
            controls={true}
            playing={false}
            style={{
              position: 'absolute',
              top: 0,
              left: 0
            }}
            config={{
              file: {
                attributes: {
                  controlsList: 'download',
                  disablePictureInPicture: true
                },
                forceVideo: true
              }
            }}
            onError={(e) => console.error('Video player error:', e)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const Tasks = () => {
  const [ tasksList, setTasksList ] = useState([]);
  const [ loading, setLoading ] = useState(true);
  const [ activeId, setActiveId ] = useState(null);
  const [ openFreezeDialog, setOpenFreezeDialog ] = useState(false);
  const [ openUnfreezeDialog, setOpenUnfreezeDialog ] = useState(false);
  const [ openCompleteDialog, setOpenCompleteDialog ] = useState(false);
  const [ selectedTask, setSelectedTask ] = useState(null);
  const [ helpDialogOpen, setHelpDialogOpen ] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [ pendingStatusChange, setPendingStatusChange ] = useState(null);

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Only fetch tasks, remove freeze requests fetch
        const tasksResults = await Promise.all([
          getMemberTasks(token, 'Opened'),
          getMemberTasks(token, 'Completed'),
          getMemberTasks(token, 'Delayed'),
          getMemberTasks(token, 'Frozen')
        ]).catch(error => {
          throw new Error(`Failed to fetch tasks: ${error.message}`);
        });
        
        const formatTasks = (tasks = []) => tasks.map(task => {
          if (!task) return null;

          return {
            ...task,
            createdAt: task.createdAt,
            completedAt: task.completedAt,
            frozenAt: task.frozenAt,
            reason: task.reason
          };
        }).filter(Boolean);

        const allTasks = [
          ...formatTasks(tasksResults[ 0 ]?.data || []).map(task => ({ ...task, status: 'Opened' })),
          ...formatTasks(tasksResults[ 1 ]?.data || []).map(task => ({ ...task, status: 'Completed' })),
          ...formatTasks(tasksResults[ 2 ]?.data || []).map(task => ({ ...task, status: 'Delayed' })),
          ...formatTasks(tasksResults[ 3 ]?.data || []).map(task => ({ ...task, status: 'Frozen' }))
        ];

        console.log('Fetched tasks:', allTasks);

        setTasksList(allTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error(error.message || 'Failed to load tasks');
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
        setPendingStatusChange(null);
        setOpenFreezeDialog(true);
    } else if (activeTask.status === 'Frozen' && overStatus === 'Opened') {
      setOpenUnfreezeDialog(true);
    } else if (activeTask.status === 'Opened' && overStatus === 'Completed') {
      setOpenCompleteDialog(true);
    }
    else if (activeTask.status === 'Delayed' && overStatus === 'Completed') {
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
            freezingReason: task.reason,
            freezeRequestedAt: new Date().toISOString()
          };
          success = true;
          break;

        case 'unfreeze':
          updatedTask = {
            ...task,
            status: 'Opened',
            frozenAt: null,
            freezingReason: null,
            freezeRequestedAt: null
          };
          success = true;
          break;

        case 'complete':
          updatedTask = {
            ...task,
            status: task.status === 'Delayed' ? 'Delayed' : 'Opened',
            completedDate: new Date().toLocaleDateString('en-US'),
            completionNotes: task.notes
          };
          success = true;
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
      toast.error(error.response?.data || 'Failed to update task');
      setPendingStatusChange(null);
    }
  };

  const renderHelpLink = () => (
    <Box
      sx={{
        position: 'absolute',
        bottom: -230,
        paddingBottom: 2,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: 'pointer',
        color: 'text.secondary',
        '&:hover': {
          color: 'primary.main',
          textDecoration: 'underline'
        }
      }}
      onClick={() => setHelpDialogOpen(true)}
    >
      <HelpOutlineIcon fontSize="small" />
      <Typography variant="body2">
        If you got stuck, click here
      </Typography>
    </Box>
  );

  // Modify the return statement to include both the help link and dialog
  return (
    <>
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
      {renderHelpLink()}
      <DragDropHelpDialog 
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
      />
    </>
  );
};

export default Tasks;