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
import { createEvent, deleteEvent } from '../../../services/calendarService';

export default function Calendar() {
    const [ currentEvents, setCurrentEvents ] = useState([]);
    const [ isAddEventModalOpen, setIsAddEventModalOpen ] = useState(false);
    const [ isConfirmModalOpen, setIsConfirmModalOpen ] = useState(false);
    const [ selectedEvent, setSelectedEvent ] = useState(null);
    const [ newEventTitle, setNewEventTitle ] = useState('');
    const [ newEventTime, setNewEventTime ] = useState('');
    const [ userId, setUserId ] = useState(null);

    const cleanupLocalStorage = () => {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('events') && !key.includes('events_')) {
                localStorage.removeItem(key);
            }
            if (key === 'events_undefined') {
                localStorage.removeItem(key);
            }
        });
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const user = JSON.parse(localStorage.getItem('user')); // Parse user object
        if (token && user) {
            const decoded = decodeToken(token);
            const currentUserId = decoded.id;
            setUserId(currentUserId);

            cleanupLocalStorage();

            setCurrentEvents([]);

            const savedEvents = localStorage.getItem(`events_${user.displayName}`);
            if (savedEvents) {
                try {
                    const parsedEvents = JSON.parse(savedEvents);
                    const userEvents = parsedEvents.filter(event => event.userId === currentUserId);
                    setCurrentEvents(userEvents);
                } catch (error) {
                    console.error("Error parsing localStorage events:", error);
                    setCurrentEvents([]);
                }
            }
        }

        return () => {
            setCurrentEvents([]);
            setUserId(null);
        };
    }, []); // Remove userId.displayName from dependencies

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user')); // Parse user object
        if (currentEvents.length >= 0 && userId && user) {
            const userEvents = currentEvents.filter(event => event.userId === userId);
            localStorage.setItem(`events_${user.displayName}`, JSON.stringify(userEvents));
        }
    }, [ currentEvents, userId ]);

    function handleDateSelect(selectInfo) {
        const selectedDate = new Date(selectInfo.start);
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            selectInfo.view.calendar.unselect();
            return;
        }

        setIsAddEventModalOpen(true);
        setSelectedEvent(selectInfo);
    }

    function checkEventOverlap(newStart, newEnd, existingEvents, excludeEventId = null) {
        const start = new Date(newStart);
        const end = new Date(newEnd);

        return existingEvents.some(event => {
            if (event.id === excludeEventId) return false;

            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);

            return (start < eventEnd && end > eventStart);
        });
    }

    async function handleAddEvent() {
        if (!newEventTitle.trim() || !newEventTime) {
            toast.error('Event title and time are required');
            return;
        }

        let calendarApi = selectedEvent.view.calendar;
        calendarApi.unselect();

        // Create date with selected date and time
        const startDate = new Date(selectedEvent.startStr);
        const [hours, minutes] = newEventTime.split(':');
        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);

        if (checkEventOverlap(startDate, endDate, currentEvents)) {
            toast.error('Cannot add event: Time slot is already occupied');
            return;
        }

        // Create temporary event object
        const tempEvent = {
            title: newEventTitle.trim(),
            eventDate: startDate.toISOString(),
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            allDay: false,
            userId: userId
        };

        try {
            const token = localStorage.getItem('authToken');
            const response = await createEvent({
                title: tempEvent.title,
                eventDate: tempEvent.eventDate
            }, token);

            // Create final event object with backend-generated ID
            const newEvent = {
                ...tempEvent,
                id: response.data.id.toString() // Use the backend-generated ID
            };

            console.log('Event created:', response.data);
            setCurrentEvents(prevEvents => [...prevEvents, newEvent]);
            setIsAddEventModalOpen(false);
            setNewEventTitle('');
            setNewEventTime('');
            toast.success('Event created successfully');
        } catch (error) {
            toast.error('Failed to create event: ' + (error.response?.data?.message || error.message));
        }
    }

    function handleEventClick(clickInfo) {
        if (isPastDate(clickInfo.event.start)) {
            toast.info("Cannot modify past events");
            return;
        }
        setSelectedEvent(clickInfo.event);
        setIsConfirmModalOpen(true);
    }

    async function handleConfirmDelete() {
        if (selectedEvent.extendedProps.userId !== userId) {
            toast.error('Cannot delete events from other users');
            setIsConfirmModalOpen(false);
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            console.log('Selected event:', selectedEvent);
            console.log('selected id:', selectedEvent.id);
            const response = await deleteEvent(selectedEvent.id, token);
            console.log('Event deleted:', response.data);
            
            // Remove from calendar
            selectedEvent.remove();

            // Update local state
            const updatedEvents = currentEvents.filter(event => event.id !== selectedEvent.id);
            setCurrentEvents(updatedEvents);

            // Update localStorage
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                localStorage.setItem(`events_${user.displayName}`, JSON.stringify(updatedEvents));
            }

            setIsConfirmModalOpen(false);
            toast.success('Event deleted successfully');
        } catch (error) {
            console.log('Selected event:', selectedEvent);
            console.log('selected id:', selectedEvent.id);
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

    function handleEventDrop(dropInfo) {
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

        if (checkEventOverlap(event.start, event.end, currentEvents, event.id)) {
            dropInfo.revert();
            toast.error('Cannot move event: Time slot is already occupied');
            return;
        }

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
    }



    const handleResizeStart = (info) => {
        if (isPastDate(info.event.start)) {
            info.revert();
            toast.error('Cannot resize past events');
        }
    };

    const handleEventResize = (resizeInfo) => {
        const { event } = resizeInfo;

        if (event.extendedProps.userId !== userId) {
            resizeInfo.revert();
            toast.error('Cannot modify events from other users');
            return;
        }

        if (isPastDate(event.start)) {
            resizeInfo.revert();
            toast.error('Cannot resize events to past dates');
            return;
        }

        if (checkEventOverlap(event.start, event.end, currentEvents, event.id)) {
            resizeInfo.revert();
            toast.error('Cannot resize: Time slot is already occupied');
            return;
        }

        setCurrentEvents(prevEvents =>
            prevEvents.map(ev =>
                ev.id === event.id
                    ? {
                        ...ev,
                        start: event.startStr,
                        end: event.endStr
                    }
                    : ev
            )
        );
    };

    return (
        <div className="calendar-page">
            <Sidebar currentEvents={currentEvents} />
            <div className='calendar-main'>
                <FullCalendar
                    plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    initialView='dayGridMonth'
                    editable={true}
                    eventStartEditable={true}
                    eventDurationEditable={true}
                    eventResizableFromStart={true}
                    eventResizable={true} // Add this prop
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    initialEvents={currentEvents}
                    select={handleDateSelect}
                    eventContent={renderEventContent}
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    eventResizeStart={handleResizeStart} // Add this handler
                    eventClassNames='fc-event'
                    eventDisplay="block"
                    height="100%"
                    events={currentEvents}
                    selectConstraint={{
                        start: new Date().toISOString().split('T')[ 0 ]
                    }}
                />
            </div>

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
                        color="black"
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
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

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
                        color="black"
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            borderRadius: '4px',
                            padding: '0.5rem 1.5rem',
                        }}
                    >
                        No
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
                        Yes
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

function renderEventContent(eventInfo) {
    const formattedTime = formatEventTime(eventInfo.timeText);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
            <b>{formattedTime}</b>
            <i>{eventInfo.event.title}</i>
        </div>
    );
}

function Sidebar({ currentEvents }) {
    return (
        <div className='calendar-sidebar'>
            <div className='calendar-sidebar-section'>
                <h2>ⓘ &nbsp; Instructions</h2>
                <ul>
                    <li>Select dates and you will be prompted to create a new event</li>
                    <li>Drag, drop, and resize events</li>
                    <li>Click an event to delete it</li>
                </ul>
            </div>
            <div className='calendar-sidebar-section'>
                <h2>All Events ({currentEvents.length})</h2>
                <ul>
                    {currentEvents.map((event) => (
                        <SidebarEvent key={event.id} event={event} />
                    ))}
                </ul>
            </div>
        </div>
    );
}

function SidebarEvent({ event }) {
    return (
        <li key={event.id} className="sidebar-event" >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <b>{event.dateDisplay || formatDate(event.start, { year: 'numeric', month: 'short', day: 'numeric' })}</b>
                <i>{event.title}</i>
            </div>
        </li>
    );
}