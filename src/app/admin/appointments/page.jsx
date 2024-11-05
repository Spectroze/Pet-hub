"use client";
import React, { useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from "@mui/material";

const localizer = momentLocalizer(moment);

export default function AppointmentCalendar() {
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState({
    title: "",
    petOwner: "",
    service: "",
    status: "Scheduled",
  });
  // State for controlling the current date and view of the calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(Views.WEEK);

  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setOpenDialog(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setOpenViewDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSlot(null);
    setAppointmentDetails({
      title: "",
      petOwner: "",
      service: "",
      status: "Scheduled",
    });
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedEvent(null);
  };

  const handleCreateAppointment = () => {
    if (
      !appointmentDetails.title ||
      !appointmentDetails.petOwner ||
      !appointmentDetails.service
    ) {
      alert("Please fill out all fields.");
      return;
    }

    const newEvent = {
      start: selectedSlot.start,
      end: selectedSlot.end,
      title: appointmentDetails.title,
      petOwner: appointmentDetails.petOwner,
      service: appointmentDetails.service,
      status: appointmentDetails.status,
    };
    setEvents([...events, newEvent]);
    handleCloseDialog();
  };

  const handleUpdateAppointment = (updatedEvent) => {
    const updatedEvents = events.map((event) =>
      event === selectedEvent ? { ...event, ...updatedEvent } : event
    );
    setEvents(updatedEvents);
    handleCloseViewDialog();
  };

  const handleDeleteAppointment = () => {
    const updatedEvents = events.filter((event) => event !== selectedEvent);
    setEvents(updatedEvents);
    handleCloseViewDialog();
  };

  const handleMarkAsDone = () => {
    handleUpdateAppointment({ status: "Done" });
  };

  // Handles navigation and changing the calendar view
  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleNavigate = (date) => {
    setCurrentDate(date);
  };

  return (
    <>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        views={["month", "week", "day", "agenda"]} // Enable different views
        view={view} // Set the current view
        onView={handleViewChange} // Handle changing views
        date={currentDate} // Set the current date
        onNavigate={handleNavigate} // Handle navigation
        eventPropGetter={(event) => {
          let backgroundColor = "#3174ad";
          if (event.status === "Done") {
            backgroundColor = "#4caf50";
          }
          return { style: { backgroundColor } };
        }}
      />
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Create Appointment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={appointmentDetails.title}
            onChange={(e) =>
              setAppointmentDetails({
                ...appointmentDetails,
                title: e.target.value,
              })
            }
          />
          <TextField
            margin="dense"
            label="Pet Owner"
            fullWidth
            value={appointmentDetails.petOwner}
            onChange={(e) =>
              setAppointmentDetails({
                ...appointmentDetails,
                petOwner: e.target.value,
              })
            }
          />
          <TextField
            margin="dense"
            label="Service"
            fullWidth
            value={appointmentDetails.service}
            onChange={(e) =>
              setAppointmentDetails({
                ...appointmentDetails,
                service: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreateAppointment}>Create</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog}>
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant="body1">
                Title: {selectedEvent.title}
              </Typography>
              <Typography variant="body1">
                Pet Owner: {selectedEvent.petOwner}
              </Typography>
              <Typography variant="body1">
                Service: {selectedEvent.service}
              </Typography>
              <Typography variant="body1">
                Date: {moment(selectedEvent.start).format("MMMM D, YYYY")}
              </Typography>
              <Typography variant="body1">
                Time: {moment(selectedEvent.start).format("h:mm A")} -{" "}
                {moment(selectedEvent.end).format("h:mm A")}
              </Typography>
              <Typography variant="body1">
                Status: {selectedEvent.status}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteAppointment} color="secondary">
            Delete
          </Button>
          {selectedEvent && selectedEvent.status !== "Done" && (
            <Button onClick={handleMarkAsDone} color="primary">
              Mark as Done
            </Button>
          )}
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
