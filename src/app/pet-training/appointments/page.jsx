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
  Snackbar,
  Alert,
} from "@mui/material";
import { Account, Client, Query } from "appwrite";
import { appwriteConfig, databases } from "../../../lib/appwrite";

const localizer = momentLocalizer(moment);

// Initialize Appwrite Client
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67094c000023e950be96");

// Set the client to the appwriteConfig object
appwriteConfig.client = client;

// Initialize the Appwrite Account object using the configured client
const account = new Account(client);

export default function AppointmentCalendar({ databaseId, collectionId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeclineDialog, setOpenDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState({
    petOwner: "",
    service: "",
    status: [],
    petAvatar: "",
    userAvatar: "",
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(Views.WEEK);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const dbId = appwriteConfig.databaseId;
  const petCollId = appwriteConfig.petCollectionId;
  const usersCollId = appwriteConfig.userCollectionId;

  const constructAvatarUrl = (avatarId) => {
    return avatarId.startsWith("http")
      ? avatarId
      : `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.bucketId}/files/${avatarId}/view?project=${appwriteConfig.projectId}`;
  };

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

  const parseDateTime = (date, time = "00:00") => {
    const combined = `${date} ${time}`;
    const parsedDate = moment.tz(combined, "YYYY-MM-DD HH:mm", "Asia/Manila");
    return parsedDate.isValid() ? parsedDate.toDate() : new Date();
  };
  const fetchAppointments = async () => {
    setLoading(true);
    setError("");

    try {
      // Use Query.contains to filter documents where "petServices" array includes "pet veterinary" or "pet grooming"
      const response = await databases.listDocuments(
        databaseId || dbId,
        collectionId || petCollId,
        [
          Query.or([
            Query.contains("petServices", "Pet Veterinary"),
            Query.contains("petServices", "Pet Grooming"),
          ]),
        ]
      );

      if (!response.documents || response.documents.length === 0) {
        setError("No appointments found.");
        setEvents([]);
        setLoading(false);
        return;
      }

      const fetchedEvents = await Promise.all(
        response.documents.map(async (appointment) => {
          const { ownerName, ownerAvatar } = appointment.ownerId
            ? await getOwnerDetails(appointment.ownerId)
            : {
                ownerName: "Unknown Owner",
                ownerAvatar: "/images/avatar-placeholder.png",
              };

          const petAvatar = appointment.petPhotoId
            ? constructAvatarUrl(appointment.petPhotoId)
            : "/images/avatar-placeholder.png";

          return {
            id: appointment.$id,
            title: appointment.petServices?.join(", ") || "No Title",
            petOwner: ownerName,
            petName: appointment.petName || "Unknown Pet",
            petSpecies: appointment.petSpecies || "Unknown Species",
            petAvatar: petAvatar,
            userAvatar: ownerAvatar,
            start: parseDateTime(appointment.petDate, appointment.petTime),
            end: parseDateTime(appointment.petDate, appointment.petTime),
            status: appointment.status || "Scheduled",
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
  }, [databaseId, collectionId]);

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

  const showNotification = (message, severity = "info") => {
    setNotification({ open: true, message, severity });
  };

  const handleAccept = async () => {
    try {
      const currentUser = await account.get(); // Use the properly configured account object

      if (!currentUser || !currentUser.$id) {
        throw new Error("User is not authenticated");
      }

      await databases.updateDocument(dbId, petCollId, selectedEvent.id, {
        status: ["Accepted"],
      });
      showNotification("Appointment Accepted", "success");
      fetchAppointments();
      handleCloseViewDialog();
    } catch (error) {
      console.error("Error accepting appointment:", error);
      showNotification(
        error.message.includes("not authorized")
          ? "You are not authorized to perform this action."
          : "Failed to accept appointment.",
        "error"
      );
    }
  };

  const handleOpenDeclineDialog = () => {
    setOpenDeclineDialog(true);
  };

  const handleDecline = async () => {
    try {
      // Convert the declineReason to an array
      await databases.updateDocument(dbId, petCollId, selectedEvent.id, {
        status: ["Declined"],
        declineReason: [declineReason], // Wrap declineReason in an array
      });
      showNotification("Appointment Declined", "warning");
      fetchAppointments();
      setOpenDeclineDialog(false);
      handleCloseViewDialog();
    } catch (error) {
      console.error("Error declining appointment:", error);
      showNotification(
        error.message.includes("not authorized")
          ? "You are not authorized to perform this action."
          : "Failed to decline appointment.",
        "error"
      );
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
                <Typography variant="body1" color="primary" mt={2}>
                  <strong>Status:</strong> {selectedEvent.status}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleAccept}
            color="primary"
            disabled={selectedEvent?.status === "Accepted"}
          >
            Accept
          </Button>
          <Button
            onClick={handleOpenDeclineDialog}
            color="secondary"
            disabled={selectedEvent?.status === "Accepted"}
          >
            Decline
          </Button>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

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

      {/* Snackbar for notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
