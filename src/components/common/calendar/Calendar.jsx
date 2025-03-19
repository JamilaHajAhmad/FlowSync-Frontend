import React, { useState, useEffect } from 'react';
import { formatDate } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import './Calendar.css';
import { useTheme } from '@mui/material';

Modal.setAppElement('#root');

export default function Calendar() {
    const theme = useTheme();
    const [ weekendsVisible, setWeekendsVisible ] = useState(true);
    const [ currentEvents, setCurrentEvents ] = useState([]);
    const [ isAddEventModalOpen, setIsAddEventModalOpen ] = useState(false);
    const [ isConfirmModalOpen, setIsConfirmModalOpen ] = useState(false);
    const [ selectedEvent, setSelectedEvent ] = useState(null);
    const [ newEventTitle, setNewEventTitle ] = useState('');
    const [ newEventTime, setNewEventTime ] = useState('');

    useEffect(() => {
        if (currentEvents.length > 0) {
            const simplifiedEvents = currentEvents.map(({ id, title, start, end, allDay }) => ({
                id,
                title,
                start,
                end,
                allDay,
            }));
            localStorage.setItem("events", JSON.stringify(simplifiedEvents));
        }
    }, [ currentEvents ]);

    useEffect(() => {
        const savedEvents = localStorage.getItem("events");
        if (savedEvents) {
            try {
                const parsedEvents = JSON.parse(savedEvents);
                if (Array.isArray(parsedEvents)) {
                    setCurrentEvents(parsedEvents);
                }
            } catch (error) {
                console.error("Error parsing localStorage events:", error);
                setCurrentEvents([]); // Reset if JSON is corrupted
            }
        }
    }, []);

    function handleWeekendsToggle() {
        setWeekendsVisible(!weekendsVisible);
    }

    function handleDateSelect(selectInfo) {
        setIsAddEventModalOpen(true);
        setSelectedEvent(selectInfo);
    }

    // Add this helper function to check for event overlap
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

    // Modify the handleAddEvent function
    function handleAddEvent() {
        let calendarApi = selectedEvent.view.calendar;
        calendarApi.unselect();

        if (newEventTitle) {
            // Create date object from selected date and time
            const startDate = new Date(selectedEvent.startStr);
            if (newEventTime) {
                const [hours, minutes] = newEventTime.split(':');
                startDate.setHours(parseInt(hours), parseInt(minutes));
            }

            // Create end date (1 hour after start by default)
            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() + 1);

            // Check for overlap
            if (checkEventOverlap(startDate, endDate, currentEvents)) {
                toast.error('Cannot add event: Time slot is already occupied');
                return;
            }

            const newEvent = {
                id: String(Date.now()),
                title: newEventTitle,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                allDay: !newEventTime,
            };
            setCurrentEvents(prevEvents => [...prevEvents, newEvent]);
        }
        setIsAddEventModalOpen(false);
        setNewEventTitle('');
        setNewEventTime('');
    }

    function handleEventClick(clickInfo) {
        setSelectedEvent(clickInfo.event);
        setIsConfirmModalOpen(true);
    }

    function handleConfirmDelete() {
        selectedEvent.remove();

        // Update currentEvents state
        const updatedEvents = currentEvents.filter(event => event.id !== selectedEvent.id);
        setCurrentEvents(updatedEvents);

        // Update localStorage
        localStorage.setItem("events", JSON.stringify(updatedEvents));

        setIsConfirmModalOpen(false);
    }

    // Modify handleEventDrop to check for overlap when dragging
    function handleEventDrop(dropInfo) {
        const { event } = dropInfo;
        
        // Check for overlap
        if (checkEventOverlap(event.start, event.end, currentEvents, event.id)) {
            dropInfo.revert();
            alert('Cannot move event: Time slot is already occupied');
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

    // Modify handleEventResize to check for overlap when resizing
    function handleEventResize(resizeInfo) {
        const { event } = resizeInfo;

        // Check for overlap
        if (checkEventOverlap(event.start, event.end, currentEvents, event.id)) {
            resizeInfo.revert();
            alert('Cannot resize event: Would overlap with existing event');
            return;
        }

        // Get the start and end dates
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        endDate.setDate(endDate.getDate() - 1); // Adjust end date

        // Check if the event is a single day event
        const isSingleDay = startDate.toDateString() === endDate.toDateString();

        // Create a formatted end date only if it spans multiple days
        const formattedEndDate = !isSingleDay && event.end ?
            ` - ${formatDate(endDate, { year: 'numeric', month: 'short', day: 'numeric' })}` : '';

        const updatedEvents = currentEvents.map((evt) =>
            evt.id === event.id
                ? {
                    id: evt.id,
                    title: evt.title,
                    start: event.startStr,
                    end: event.endStr,
                    allDay: event.allDay,
                    dateDisplay: isSingleDay 
                        ? formatDate(event.start, { year: 'numeric', month: 'short', day: 'numeric' })
                        : `${formatDate(event.start, { year: 'numeric', month: 'short', day: 'numeric' })}${formattedEndDate}`
                }
                : evt
        );

        // Update state
        setCurrentEvents(updatedEvents);

        // Update localStorage
        localStorage.setItem(localStorage.getItem("events"), JSON.stringify(updatedEvents));
    }

    function dayCellClassNames(info) {
        const today = new Date().getDate();
        const cellDay = info.date.getDate();
        return cellDay === today ? 'current-day' : '';
    }

    return (
        <div className='calendar-page'>
            <Sidebar
                weekendsVisible={weekendsVisible}
                handleWeekendsToggle={handleWeekendsToggle}
                currentEvents={currentEvents}
            />
            <div className='calendar-main' style={{ color: theme.palette.mode === 'dark' ? 'black' : '#000000' }}>
                <FullCalendar
                    plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    initialView='dayGridMonth'
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={weekendsVisible}
                    select={handleDateSelect}
                    eventContent={renderEventContent} // custom render function
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop} // handle event drop
                    eventResize={handleEventResize} // handle event resize
                    eventResizableFromStart={true}
                    eventClassNames='fc-event'
                    dayCellClassNames={dayCellClassNames} // Add custom class name for current day
                    height="100%"
                    events={currentEvents}
                />
            </div>

            {/* Add Event Modal */}
            <Modal
                isOpen={isAddEventModalOpen}
                onRequestClose={() => setIsAddEventModalOpen(false)}
                contentLabel="Add Event"
                className="modal"
                overlayClassName="overlay"
            >
                <h2 style={{ color: theme.palette.mode === 'dark' ? 'black' : '' }}>Add Event</h2>
                <input
                    type="text"
                    placeholder="Event Title"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                />
                <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                />
                <div className="modal-buttons">
                    <button onClick={handleAddEvent}>Add Event</button>
                    <button onClick={() => setIsAddEventModalOpen(false)}>Cancel</button>
                </div>
            </Modal>

            {/* Confirm Delete Modal */}
            <Modal
                isOpen={isConfirmModalOpen}
                onRequestClose={() => setIsConfirmModalOpen(false)}
                contentLabel="Confirm Delete"
                className="modal"
                overlayClassName="overlay"
            >
                <h2 style={{ color: theme.palette.mode === 'dark' ? 'black' : '#000000' }}>Confirm Delete</h2>
                <p style={{ color: theme.palette.mode === 'dark' ? 'black' : '#000000' }}>Are you sure you want to delete the event '{selectedEvent?.title}'?</p>
                <div className="modal-buttons">
                    <button onClick={handleConfirmDelete}>Yes</button>
                    <button onClick={() => setIsConfirmModalOpen(false)}>No</button>
                </div>
            </Modal>
        </div>
    );
}

// Add this helper function before renderEventContent
function formatEventTime(timeText) {
    if (!timeText) return '';
    return timeText
        .replace('a', 'am')
        .replace('p', 'pm')
        .toLowerCase();
}

// Update the renderEventContent function
function renderEventContent(eventInfo) {
    const formattedTime = formatEventTime(eventInfo.timeText);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
            <b>{formattedTime}</b>
            <i>{eventInfo.event.title}</i>
        </div>
    );
}

function Sidebar({ weekendsVisible, handleWeekendsToggle, currentEvents }) {
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
                <label>
                    <input
                        type='checkbox'
                        checked={weekendsVisible}
                        onChange={handleWeekendsToggle}
                    ></input>
                    toggle weekends
                </label>
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