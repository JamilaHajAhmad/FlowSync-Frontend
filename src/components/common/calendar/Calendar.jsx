import { useState, useEffect } from 'react';
import { formatDate } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import './Calendar.css';
import { decodeToken } from '../../../utils';
import { createEvent, deleteEvent, getTaskDeadlines, getEvents, updateEvent } from '../../../services/calendarService';

export default function Calendar() {
    const [currentEvents, setCurrentEvents] = useState([]);
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isDeadlineInfoModalOpen, setIsDeadlineInfoModalOpen] = useState(false);
    const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDeadline, setSelectedDeadline] = useState(null);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventTime, setNewEventTime] = useState('');
    const [editEventTitle, setEditEventTitle] = useState('');
    const [editEventTime, setEditEventTime] = useState('');
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (token && user) {
            const decoded = decodeToken(token);
            const currentUserId = decoded.id;
            const role = decoded.role;
            setUserId(currentUserId);

            fetchAllEvents(token, currentUserId, role);
        }

        return () => {
            setCurrentEvents([]);
            setUserId(null);
        };
    }, []);

    const fetchAllEvents = async (token, currentUserId, role) => {
        try {
            const eventsResponse = await getEvents(token);
            
            // Transform API events to calendar events format
            let events = eventsResponse.data.map(event => {
                // إنشاء كائن تاريخ جديد من التاريخ المخزن
                const serverDate = new Date(event.eventDate);
                
                // إنشاء تاريخ البداية مع الحفاظ على التوقيت المحلي
                const startDate = new Date(
                    serverDate.getFullYear(),
                    serverDate.getMonth(),
                    serverDate.getDate(),
                    serverDate.getHours(),
                    serverDate.getMinutes(),
                    0,
                    0
                );

                // إنشاء تاريخ النهاية
                const endDate = new Date(startDate);
                if (startDate.getHours() === 23) {
                    endDate.setHours(23);
                    endDate.setMinutes(59);
                } else {
                    endDate.setTime(startDate.getTime() + (60 * 60 * 1000));
                }

                return {
                    id: event.id.toString(),
                    title: event.title,
                    start: startDate,
                    end: endDate,
                    allDay: false,
                    userId: currentUserId,
                    isDeadline: false
                };
            }) || [];

            // If user is a member, fetch task deadlines
            if (role === 'Member') {
                const deadlinesResponse = await getTaskDeadlines(token);
                console.log("Fetched deadlines:", deadlinesResponse.data);
                
                if (deadlinesResponse && deadlinesResponse.data) {
                    const deadlineEvents = deadlinesResponse.data.map(deadline => {
                        // Create new date from deadline start
                        const startDate = new Date(deadline.start);
                        
                        // Create end date with same day handling for 11:XX PM
                        const endDate = new Date(startDate);
                        if (startDate.getHours() === 23) {
                            endDate.setHours(23);
                            endDate.setMinutes(59);
                        } else {
                            endDate.setTime(startDate.getTime() + (60 * 60 * 1000));
                        }

                        return {
                            id: `deadline-${deadline.title.split('#')[1] || Date.now()}`,
                            title: deadline.title,
                            start: startDate.toISOString(),
                            end: endDate.toISOString(), // Use calculated end date
                            allDay: false,
                            userId: currentUserId,
                            isDeadline: true,
                            color: deadline.color || '#FF4444',
                            editable: false
                        };
                    });
                    events = [...events, ...deadlineEvents];
                }
            }

            setCurrentEvents(events);
        } catch (error) {
            console.error("Error fetching events:", error);
            toast.error("Failed to load events");
        }
    };

    function handleDateSelect(selectInfo) {
        const selectedDate = new Date(selectInfo.start);
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            selectInfo.view.calendar.unselect();
            toast.warning("Cannot create events in the past");
            return;
        }

        setIsAddEventModalOpen(true);
        setSelectedEvent(selectInfo);
    }

    function checkEventOverlap(newEventDate, existingEvents, excludeEventId = null) {
    const newDate = new Date(newEventDate);
    const newDateOnly = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
    const newTime = newDate.getHours() * 60 + newDate.getMinutes(); // Convert to minutes for easier comparison

    return existingEvents.some(event => {
        if (event.id === excludeEventId) return false;
        if (event.isDeadline) return false; // Skip deadline events
        
        // Get the event date (handle both transformed events with start and raw API events with eventDate)
        const eventDate = new Date(event.start || event.eventDate);
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        
        // Only check events on the same date
        if (newDateOnly.getTime() !== eventDateOnly.getTime()) {
            return false;
        }
        
        // Check if the times are the same (same hour and minute)
        const eventTime = eventDate.getHours() * 60 + eventDate.getMinutes();
        return newTime === eventTime;
    });
}

    async function handleAddEvent() {
        if (!newEventTitle.trim() || !newEventTime) {
            toast.error('Event title and time are required');
            return;
        }

        let calendarApi = selectedEvent.view.calendar;
        calendarApi.unselect();

        const [hours, minutes] = newEventTime.split(':');
        
        // إنشاء كائن تاريخ جديد من التاريخ المحدد
        const selectedDate = new Date(selectedEvent.startStr || selectedEvent.start);
        
        // ضبط التوقيت مع الحفاظ على نفس اليوم
        const startDate = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            parseInt(hours),
            parseInt(minutes),
            0,
            0
        );

        // إنشاء تاريخ النهاية في نفس اليوم
        const endDate = new Date(startDate);
        if (parseInt(hours) === 23) {
            endDate.setHours(23);
            endDate.setMinutes(59);
        } else {
            endDate.setTime(startDate.getTime() + (60 * 60 * 1000));
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await createEvent({
                title: newEventTitle.trim(),
                eventDate: startDate.toISOString()
            }, token);

            const newEvent = {
                id: response.data.id.toString(),
                title: newEventTitle.trim(),
                start: startDate,
                end: endDate,
                allDay: false,
                userId: userId,
                isDeadline: false
            };

            setCurrentEvents(prevEvents => [...prevEvents, newEvent]);
            setIsAddEventModalOpen(false);
            setNewEventTitle('');
            setNewEventTime('');
            toast.success('Event created successfully');
        } catch (error) {
            console.error('Error creating event:', error);
            toast.error('Failed to create event: ' + (error.response?.data?.message || error.message));
        }
    }

    function handleEventClick(clickInfo) {
        if (clickInfo.event.extendedProps.isDeadline) {
            setSelectedDeadline(clickInfo.event);
            setIsDeadlineInfoModalOpen(true);
            return;
        }

        if (isPastDate(clickInfo.event.start)) {
            toast.info("Cannot modify past events");
            return;
        }

        if (clickInfo.event.extendedProps.userId !== userId) {
            toast.error('Cannot modify events from other users');
            return;
        }
        
        setSelectedEvent(clickInfo.event);
        // Pre-fill edit form with current event data
        const eventDate = new Date(clickInfo.event.start);
        setEditEventTitle(clickInfo.event.title);
        setEditEventTime(
            eventDate.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            })
        );
        setIsEditEventModalOpen(true);
    }

    async function handleConfirmDelete() {
        if (selectedEvent.extendedProps.userId !== userId) {
            toast.error('Cannot delete events from other users');
            setIsConfirmModalOpen(false);
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            await deleteEvent(selectedEvent.id, token);
            
            // Remove from calendar
            selectedEvent.remove();

            // Update local state
            setCurrentEvents(prevEvents => 
                prevEvents.filter(event => event.id !== selectedEvent.id)
            );

            // Close both modals
            setIsConfirmModalOpen(false);
            setIsEditEventModalOpen(false);
            toast.success('Event deleted successfully');
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Failed to delete event: ' + (error.response?.data?.message || error.message));
            setIsConfirmModalOpen(false);
        }
    }

    const isPastDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate < today;
    };

    async function handleEventDrop(dropInfo) {
        if (dropInfo.event.extendedProps.isDeadline) {
            dropInfo.revert();
            toast.error('Task deadlines cannot be moved');
            return;
        }

        const { event } = dropInfo;

        if (event.extendedProps.userId !== userId) {
            dropInfo.revert();
            toast.error('Cannot modify events from other users');
            return;
        }

        if (isPastDate(event.start)) {
            dropInfo.revert();
            toast.error('Cannot move event to past dates');
            return;
        }

        // Check for overlap excluding deadline events
        const nonDeadlineEvents = currentEvents.filter(e => !e.isDeadline);
        if (checkEventOverlap(event.start, nonDeadlineEvents, event.id)) {
            dropInfo.revert();
            toast.error('Cannot move event: Time slot is already occupied');
            return;
        }

        try {
            // Update local state only (removed updateEvent API call)
            setCurrentEvents((prevEvents) =>
                prevEvents.map((evt) =>
                    evt.id === event.id
                        ? {
                            ...evt,
                            start: event.startStr,
                            end: event.endStr,
                            allDay: event.allDay,
                        }
                        : evt
                )
            );

            toast.success('Event moved successfully');
        } catch (error) {
            console.error('Error updating event:', error);
            dropInfo.revert();
            toast.error('Failed to move event');
        }
    }

    async function handleEventUpdate() {
        if (!editEventTitle.trim() || !editEventTime) {
            toast.error('Event title and time are required');
            return;
        }

        const eventDate = new Date(selectedEvent.start);
        const [hours, minutes] = editEventTime.split(':');
        
        const updatedDate = new Date(
            eventDate.getFullYear(),
            eventDate.getMonth(),
            eventDate.getDate(),
            parseInt(hours),
            parseInt(minutes),
            0,
            0
        );

        // Check for overlap
        if (checkEventOverlap(updatedDate, currentEvents, selectedEvent.id)) {
            toast.error('Cannot update event: Time slot is already occupied');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            await updateEvent(selectedEvent.id, {
                title: editEventTitle.trim(),
                eventDate: updatedDate.toISOString()
            }, token);

            // Update local state
            setCurrentEvents(prevEvents =>
                prevEvents.map(event =>
                event.id === selectedEvent.id
                    ? {
                        ...event,
                        title: editEventTitle.trim(),
                        start: updatedDate.toISOString(),
                        end: new Date(updatedDate.getTime() + 60 * 60 * 1000).toISOString()
                    }
                    : event
            ))

            setIsEditEventModalOpen(false);
            toast.success('Event updated successfully');
        } catch (error) {
            console.error('Error updating event:', error);
            toast.error('Failed to update event: ' + (error.response?.data?.message || error.message));
        }
    }

    return (
        <div className="calendar-page">
            <Sidebar currentEvents={currentEvents} />
            <div className='calendar-main'>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    initialView='dayGridMonth'
                    editable={true}
                    eventStartEditable={true}
                    eventDurationEditable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    select={handleDateSelect}
                    eventContent={renderEventContent}
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}
                    eventClassNames={(eventInfo) => {
                        return eventInfo.event.extendedProps.isDeadline ? 'fc-event-deadline' : 'fc-event';
                    }}
                    eventDisplay="block"
                    height="100%"
                    events={currentEvents}
                    selectConstraint={{
                        start: new Date().toISOString().split('T')[0]
                    }}
                    timeZone='local'
                />
            </div>

            {/* Add Event Modal */}
            <Dialog
                open={isAddEventModalOpen}
                onClose={() => setIsAddEventModalOpen(false)}
                aria-labelledby="add-event-dialog-title"
                sx={{
                    '& .MuiDialog-paper': {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        width: '500px',
                        maxWidth: '90vw',
                        height: 'auto',
                    },
                }}
            >
                <DialogTitle id="add-event-dialog-title" sx={{ fontWeight: 'bold', fontSize: '1.25rem', textAlign: 'center' }}>
                    Add Event
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        label="Event Title"
                        type="text"
                        fullWidth
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        sx={{ marginBottom: '1rem' }}
                    />
                    <TextField
                        margin="dense"
                        label="Event Time"
                        placeholder="--:--"
                        type="time"
                        required
                        fullWidth
                        value={newEventTime}
                        onChange={(e) => setNewEventTime(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', padding: '1rem' }}>
                    <Button
                        onClick={() => setIsAddEventModalOpen(false)}
                        color="inherit"
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            borderRadius: '4px',
                            padding: '0.5rem 1.5rem',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddEvent}
                        color="primary"
                        variant="contained"
                        disabled={!newEventTitle.trim() || !newEventTime}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '4px',
                            padding: '0.5rem 1.5rem',
                            '&.Mui-disabled': {
                                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                color: 'rgba(0, 0, 0, 0.26)'
                            }
                        }}
                    >
                        Add Event
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog
                open={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                aria-labelledby="confirm-delete-dialog-title"
                sx={{
                    '& .MuiDialog-paper': {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        padding: '1rem',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        width: '500px',
                        maxWidth: '90vw',
                        height: 'auto',
                    },
                }}
            >
                <DialogTitle id="confirm-delete-dialog-title" sx={{ fontWeight: 'bold', fontSize: '1.25rem', textAlign: 'center' }}>
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <p style={{ textAlign: 'center', margin: '0.1rem 0' }}>
                        Are you sure you want to delete the event <b>'{selectedEvent?.title}'</b>?
                    </p>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', padding: '1rem' }}>
                    <Button
                        onClick={() => setIsConfirmModalOpen(false)}
                        color="inherit"
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            borderRadius: '4px',
                            padding: '0.5rem 1.5rem',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        sx={{
                            textTransform: 'none',
                            borderRadius: '4px',
                            padding: '0.5rem 1.5rem',
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Deadline Info Modal */}
            <Dialog
                open={isDeadlineInfoModalOpen}
                onClose={() => setIsDeadlineInfoModalOpen(false)}
                aria-labelledby="deadline-info-dialog-title"
                sx={{
                    '& .MuiDialog-paper': {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        padding: '1rem',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        width: '400px',
                        maxWidth: '90vw',
                        height: 'auto',
                    },
                }}
            >
                <DialogTitle id="deadline-info-dialog-title" sx={{ fontWeight: 'bold', fontSize: '1.25rem', textAlign: 'center' }}>
                    Deadline Information
                </DialogTitle>
                <DialogContent>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0.5rem 0' }}>
                            <b>{selectedDeadline?.title}</b>
                        </p>
                        <p style={{ margin: '0.5rem 0', color: '#555' }}>
                            {selectedDeadline && formatDeadlineDateTime(selectedDeadline.start)}
                        </p>
                        <p style={{ margin: '0.5rem 0', color: '#d32f2f' }}>
                            ⚠️ This is a deadline event. It cannot be moved or deleted.
                        </p>
                    </div>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', padding: '1rem' }}>
                    <Button
                        onClick={() => setIsDeadlineInfoModalOpen(false)}
                        color="primary"
                        variant="contained"
                        sx={{
                            textTransform: 'none',
                            borderRadius: '4px',
                            padding: '0.5rem 1.5rem',
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Event Modal */}
            <Dialog
                open={isEditEventModalOpen}
                onClose={() => setIsEditEventModalOpen(false)}
                aria-labelledby="edit-event-dialog-title"
                sx={{
                    '& .MuiDialog-paper': {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        width: '500px',
                        maxWidth: '90vw',
                        height: 'auto',
                    },
                }}
            >
                <DialogTitle id="edit-event-dialog-title" sx={{ fontWeight: 'bold', fontSize: '1.25rem', textAlign: 'center' }}>
                    Edit Event
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        label="Event Title"
                        type="text"
                        fullWidth
                        value={editEventTitle}
                        onChange={(e) => setEditEventTitle(e.target.value)}
                        sx={{ marginBottom: '1rem' }}
                    />
                    <TextField
                        margin="dense"
                        label="Event Time"
                        type="time"
                        required
                        fullWidth
                        value={editEventTime}
                        onChange={(e) => setEditEventTime(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', padding: '1rem' }}>
                    <Button
                        onClick={() => setIsEditEventModalOpen(false)}
                        color="inherit"
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            borderRadius: '4px',
                            padding: '0.5rem 1.5rem',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            setIsConfirmModalOpen(true);
                            setIsEditEventModalOpen(false);
                        }}
                        color="error"
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            borderRadius: '4px',
                            padding: '0.5rem 1.5rem',
                            marginRight: '1rem'
                        }}
                    >
                        Delete
                    </Button>
                    <Button
                        onClick={handleEventUpdate}
                        color="primary"
                        variant="contained"
                        disabled={!editEventTitle.trim() || !editEventTime}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '4px',
                            padding: '0.5rem 1.5rem',
                        }}
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

function formatEventTime(timeText) {
    if (!timeText) return '';
    return timeText
        .replace('a', 'am')
        .replace('p', 'pm')
        .toLowerCase();
}

function formatDeadlineDateTime(dateTimeString) {
    try {
        const date = new Date(dateTimeString);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        return `${formattedDate} at ${formattedTime}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
}

function renderEventContent(eventInfo) {
    const isDeadline = eventInfo.event.extendedProps.isDeadline;
    
    if (isDeadline) {
        // For deadline events, extract time from the start date
        const eventDate = new Date(eventInfo.event.start);
        const timeString = eventDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                textAlign: 'center',
                backgroundColor: '#ffe5e5',
                border: '2px solid #ff4444',
                padding: '4px 6px',
                borderRadius: '4px',
                margin: '1px 0',
                width: '100%'
            }}>
                <small style={{ color: '#d32f2f', fontSize: '0.7em' }}>
                    {timeString}
                </small>
                <i style={{
                    color: '#d32f2f',
                    fontWeight: '500',
                    fontSize: '0.8em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    ⚠️ {eventInfo.event.title}
                </i>
            </div>
        );
    } else {
        // For regular events
        const eventDate = new Date(eventInfo.event.start);
        const timeString = eventDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const formattedTime = formatEventTime(timeString);
        
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                textAlign: 'center',
                padding: '4px 6px',
                width: '100%'
            }}>
                <b style={{ fontSize: '0.8em' }}>{formattedTime}</b>
                <i style={{ fontSize: '0.8em' }}>{eventInfo.event.title}</i>
            </div>
        );
    }
}

function Sidebar({ currentEvents }) {
    const regularEvents = currentEvents.filter(event => !event.isDeadline);

    return (
        <div className='calendar-sidebar'>
            <div className='calendar-sidebar-section'>
                <h2>ⓘ &nbsp; Instructions</h2>
                <ul>
                    <li>Select dates and you will be prompted to create a new event</li>
                    <li>Drag and drop events to reschedule</li>
                    <li>Click an event to delete it</li>
                    <li>Deadline events (⚠️) cannot be modified</li>
                    <li>Past events cannot be modified</li>
                    <li>Events can't be scheduled at the same time</li>
                    <li>You can only modify your own events</li>
                </ul>
            </div>
            <div className='calendar-sidebar-section'>
                <h2>My Events ({regularEvents.length})</h2>
                <ul>
                    {regularEvents.map((event) => (
                        <SidebarEvent key={event.id} event={event} />
                    ))}
                </ul>
            </div>
        </div>
    );
}

function SidebarEvent({ event }) {
    return (
        <li key={event.id} className="sidebar-event">
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                backgroundColor: 'transparent',
                padding: '0',
                borderRadius: '0',
                border: 'none'
            }}>
                <b style={{ color: 'inherit' }}>
                    {event.dateDisplay || formatDate(event.start, { year: 'numeric', month: 'short', day: 'numeric' })}
                </b>
                <i style={{ color: 'inherit' }}>
                    {event.title}
                </i>
            </div>
        </li>
    );
}
