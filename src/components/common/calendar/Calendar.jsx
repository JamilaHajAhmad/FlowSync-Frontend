import React, { useState, useEffect } from 'react';
import { formatDate } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
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
    }, [currentEvents]);
    

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

    function handleAddEvent() {
        let calendarApi = selectedEvent.view.calendar;
        calendarApi.unselect(); // clear date selection

        if (newEventTitle) {
            const newEvent = {
                id: String(Date.now()), // Unique ID
                title: newEventTitle,
                start: selectedEvent.startStr,
                end: selectedEvent.endStr,
                allDay: selectedEvent.allDay,
            };
            setCurrentEvents((prevEvents) => [...prevEvents, newEvent]);
        }
        setIsAddEventModalOpen(false);
        setNewEventTitle('');
    }

    function handleEventClick(clickInfo) {
        setSelectedEvent(clickInfo.event);
        setIsConfirmModalOpen(true);
    }

    function handleConfirmDelete() {
        selectedEvent.remove();
        setCurrentEvents(currentEvents.filter(event => event.id !== selectedEvent.id));
        setIsConfirmModalOpen(false);
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

function renderEventContent(eventInfo) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
            <b>{eventInfo.timeText}</b>
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
        <li key={event.id} className="sidebar-event" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <b>{formatDate(event.start, { year: 'numeric', month: 'short', day: 'numeric' })}</b>
            <i>{event.title}</i>
        </li>
    );
}