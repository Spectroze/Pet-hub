"use client";
import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment-timezone";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  TextField,
} from "@mui/material";
import { databases } from "../../../lib/appwrite";
import { appwriteConfig } from "../../../lib/appwrite";
import { Query } from "appwrite";

const localizer = momentLocalizer(moment);

export default function AppointmentCalendar({ databaseId, collectionId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeclineDialog, setOpenDeclineDialog] = useState(false); // State for decline dialog
  const [declineReason, setDeclineReason] = useState(""); // State for decline reason
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState({
    petOwner: "",
    service: "",
    status: "Scheduled",
    petAvatar: "",
    userAvatar: "",
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(Views.WEEK);

  const dbId = appwriteConfig.databaseId;
  const petCollId = appwriteConfig.petCollectionId;
  const usersCollId = appwriteConfig.userCollectionId;

  // Helper function to construct avatar URL
  const constructAvatarUrl = (avatarId) => {
    return avatarId.startsWith("http")
      ? avatarId
      : `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.bucketId}/files/${avatarId}/view?project=${appwriteConfig.projectId}`;
  };

  // Helper function to get owner details
  const getOwnerDetails = async (ownerId) => {
    if (!ownerId)
      return { ownerName: "Unknown Owner", ownerAvatar: "/placeholder.svg" };
    try {
      const response = await databases.listDocuments(dbId, usersCollId, [
        Query.equal("accountId", ownerId),
      ]);
      if (response.total === 0)
        return { ownerName: "Unknown Owner", ownerAvatar: "/placeholder.svg" };
      const user = response.documents[0];
      return {
        ownerName: user.name || "Unknown Owner",
        ownerAvatar: user.avatar
          ? constructAvatarUrl(user.avatar)
          : "/placeholder.svg",
      };
    } catch (error) {
      console.error(`Error fetching owner for accountId ${ownerId}:`, error);
      return { ownerName: "Unknown Owner", ownerAvatar: "/placeholder.svg" };
    }
  };

  // Helper function to parse date and time
  const parseDateTime = (date, time = "00:00") => {
    const combined = `${date} ${time}`;
    const parsedDate = moment.tz(combined, "YYYY-MM-DD HH:mm", "Asia/Manila");
    return parsedDate.isValid() ? parsedDate.toDate() : new Date();
  };

  // Fetch appointments and filter for "Pet Boarding" services
  const fetchAppointments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await databases.listDocuments(
        databaseId || dbId,
        collectionId || petCollId
      );

      const filteredAppointments = response.documents.filter(
        (appointment) => appointment.petServices === "Pet Boarding"
      );

      const fetchedEvents = await Promise.all(
        filteredAppointments.map(async (appointment) => {
          const { ownerName, ownerAvatar } = appointment.ownerId
            ? await getOwnerDetails(appointment.ownerId)
            : { ownerName: "Unknown Owner", ownerAvatar: "/placeholder.svg" };

          const petAvatar = appointment.petPhotoId
            ? constructAvatarUrl(appointment.petPhotoId)
            : "/placeholder.svg";

          return {
            id: appointment.$id,
            title: appointment.petServices || "No Title",
            petOwner: ownerName,
            petName: appointment.petName || "Unknown Pet",
            petSpecies: appointment.petSpecies || "Unknown Species",
            petAvatar: petAvatar,
            userAvatar: ownerAvatar,
            start: parseDateTime(appointment.petDate, appointment.petTime),
            end: parseDateTime(appointment.petDate, appointment.petTime),
          };
        })
      );

      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching appointments:", error.message);
      setError("Failed to fetch appointments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setAppointmentDetails({
      petOwner: event.petOwner,
      service: event.title,
      petAvatar: event.petAvatar,
      userAvatar: event.userAvatar,
    });
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedEvent(null);
  };

  // Handle accept action
  const handleAccept = async () => {
    try {
      await databases.updateDocument(dbId, petCollId, selectedEvent.id, {
        status: "Accepted",
      });
      alert("Appointment Accepted");
      fetchAppointments(); // Refresh appointments
      handleCloseViewDialog();
    } catch (error) {
      console.error("Error accepting appointment:", error);
      alert("Failed to accept appointment.");
    }
  };

  // Open the decline reason dialog
  const handleOpenDeclineDialog = () => {
    setOpenDeclineDialog(true);
  };

  // Handle decline action
  const handleDecline = async () => {
    try {
      // Update the appointment status and decline reason in the database
      await databases.updateDocument(dbId, petCollId, selectedEvent.id, {
        status: "Declined",
        declineReason: declineReason, // Save the decline reason
      });
      alert("Appointment Declined");
      fetchAppointments(); // Refresh appointments
      setOpenDeclineDialog(false);
      handleCloseViewDialog();
    } catch (error) {
      console.error("Error declining appointment:", error);
      alert("Failed to decline appointment.");
    }
  };

  return (
    <div>
      {loading ? (
        <Typography>Loading appointments...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          selectable
          onSelectSlot={() => {}}
          onSelectEvent={handleSelectEvent}
          views={["month", "week", "day", "agenda"]}
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor:
                event.status === "Accepted"
                  ? "#4caf50"
                  : event.status === "Declined"
                  ? "#f44336"
                  : "#3174ad",
            },
          })}
        />
      )}

      {/* Dialog for viewing appointment details */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog}>
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box display="flex" alignItems="start">
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                mr={3}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  mb={2}
                >
                  <Avatar
                    alt="User Avatar"
                    src={appointmentDetails.userAvatar}
                    sx={{ width: 56, height: 56, marginBottom: 1 }}
                    onError={(e) => (e.target.src = "/placeholder.svg")}
                  />
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    Owner Photo
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  mb={2}
                >
                  <Avatar
                    alt="Pet Avatar"
                    src={appointmentDetails.petAvatar}
                    sx={{ width: 56, height: 56, marginBottom: 1 }}
                    onError={(e) => (e.target.src = "/placeholder.svg")}
                  />
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    Pet Photo
                  </Typography>
                </Box>
              </Box>

              <Box mt={2}>
                <Typography variant="body1">
                  <strong>Services:</strong> {selectedEvent.title}
                </Typography>
                <Typography variant="body1">
                  <strong>Owner Name:</strong> {selectedEvent.petOwner}
                </Typography>
                <br />
                <Typography variant="body1">
                  <strong>Pet Name:</strong> {selectedEvent.petName}
                </Typography>
                <Typography variant="body1">
                  <strong>Pet Species:</strong> {selectedEvent.petSpecies}
                </Typography>
                <Typography variant="body1">
                  <strong>Date:</strong>{" "}
                  {moment
                    .tz(selectedEvent.start, "Asia/Manila")
                    .format("MMMM D, YYYY")}
                </Typography>
                <Typography variant="body1">
                  <strong>Time:</strong>{" "}
                  {moment
                    .tz(selectedEvent.start, "Asia/Manila")
                    .format("h:mm A")}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAccept} color="primary">
            Accept
          </Button>
          <Button onClick={handleOpenDeclineDialog} color="secondary">
            Decline
          </Button>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Decline Reason Dialog */}
      <Dialog
        open={openDeclineDialog}
        onClose={() => setOpenDeclineDialog(false)}
      >
        <DialogTitle>Decline Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Please provide a reason for declining this appointment:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Decline Reason"
            type="text"
            fullWidth
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDecline} color="secondary">
            Confirm Decline
          </Button>
          <Button onClick={() => setOpenDeclineDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
