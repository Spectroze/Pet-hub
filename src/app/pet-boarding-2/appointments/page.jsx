"use client";
import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment-timezone";
import { styled } from "@mui/system";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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
  CssBaseline,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { Query, Account, Client } from "appwrite";
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
// Styled components for enhanced design
const StyledCalendarWrapper = styled("div")(({ theme }) => ({
  "& .rbc-calendar": {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
  },
  "& .rbc-header": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(1),
  },
  "& .rbc-today": {
    backgroundColor: theme.palette.action.selected,
  },
  "& .rbc-event": {
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogTitle-root": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  "& .MuiDialogContent-root": {
    padding: theme.spacing(3),
  },
}));

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

  const [showHistory, setShowHistory] = useState(false); // Toggle between calendar and history views
  const historyEvents = events.filter((event) =>
    event.status.includes("Accepted")
  );
  // Create a theme instance
  const theme = createTheme({
    palette: {
      mode: "dark", // Set to 'light' for light theme
      primary: {
        main: "#90caf9", // Light blue
      },
      secondary: {
        main: "#f48fb1", // Light pink
      },
      background: {
        default: "#303030",
        paper: "#424242",
      },
    },
  });

  // Custom event styles
  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: event.status.includes("Accepted")
        ? theme.palette.success.main
        : event.status.includes("Declined")
        ? theme.palette.error.main
        : theme.palette.primary.main,
      color: theme.palette.getContrastText(theme.palette.primary.main),
      border: "none",
      borderRadius: "4px",
      opacity: 0.8,
      display: "block",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    };
    return { style };
  };

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
      // Query to fetch only Pet Boarding services
      const response = await databases.listDocuments(
        databaseId || dbId,
        collectionId || petCollId,
        [Query.equal("petClinic", "Clinic 2")]
      );

      if (!response.documents || response.documents.length === 0) {
        setError("No Pet Boarding appointments found.");
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
            title: appointment.petServices || "No Title",
            petOwner: ownerName,
            petName: appointment.petName || "Unknown Pet",
            petSpecies: appointment.petSpecies || "Unknown Species",
            petAvatar: petAvatar,
            userAvatar: ownerAvatar,
            start: parseDateTime(appointment.petDate, appointment.petTime),
            end: parseDateTime(appointment.petDate, appointment.petTime),
            status: appointment.status || "Pending",
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

  const filteredEvents = events.filter((event) => {
    if (view === "agenda") {
      // Show only "Accepted" appointments in agenda view
      return event.status.includes("Accepted");
    }
    // Exclude "Accepted" and "Declined" appointments from all other views
    return (
      !event.status.includes("Accepted") && !event.status.includes("Declined")
    );
  });

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

  //Accepted Appointment
  const handleAccept = async () => {
    try {
      const currentUser = await account.get();
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
  // Decline Appointment
  const handleDecline = async () => {
    try {
      await databases.updateDocument(dbId, petCollId, selectedEvent.id, {
        status: ["Declined"],
        declineReason: [declineReason],
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
  const handleOpenDeclineDialog = () => {
    setOpenDeclineDialog(true);
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box display="flex" justifyContent="space-between" mb={2}>
        {/* Toggle buttons for Calendar and History views */}
        <Button
          variant={showHistory ? "outlined" : "contained"}
          color="primary"
          onClick={() => setShowHistory(false)}
        >
          Calendar View
        </Button>
        <Button
          variant={showHistory ? "contained" : "outlined"}
          color="secondary"
          onClick={() => setShowHistory(true)}
        >
          History
        </Button>
      </Box>

      {/* Conditional rendering based on showHistory state */}
      {showHistory ? (
        <Box>
          <Typography variant="h5" align="center" gutterBottom>
            Accepted Appointments History
          </Typography>
          <Paper>
            <List>
              {historyEvents.length > 0 ? (
                historyEvents.map((event) => (
                  <ListItem key={event.id}>
                    <ListItemAvatar>
                      <Avatar>{event.petName[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={event.title}
                      secondary={`${moment(event.start).format(
                        "MMMM D, YYYY"
                      )} - ${event.petName} (${event.petSpecies})`}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography align="center" color="textSecondary" mt={2}>
                  No accepted appointments found.
                </Typography>
              )}
            </List>
          </Paper>
        </Box>
      ) : (
        <StyledCalendarWrapper>
          {loading ? (
            <Typography>Loading appointments...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }} // Increased height for better visibility
              selectable
              onSelectEvent={handleSelectEvent}
              views={["month", "week", "day", "agenda"]}
              view={view}
              onView={setView}
              date={currentDate}
              onNavigate={setCurrentDate}
              eventPropGetter={eventStyleGetter}
              dayPropGetter={(date) => {
                const today = new Date();
                if (
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear()
                ) {
                  return {
                    style: {
                      backgroundColor: theme.palette.action.hover,
                    },
                  };
                }
                return {};
              }}
            />
          )}
        </StyledCalendarWrapper>
      )}

      {/* Dialog and Snackbar components */}
      <StyledDialog open={openViewDialog} onClose={handleCloseViewDialog}>
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
                    sx={{ width: 80, height: 80, marginBottom: 1 }}
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
                    sx={{ width: 80, height: 80, marginBottom: 1 }}
                    onError={(e) => (e.target.src = "/placeholder.svg")}
                  />
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    Pet Photo
                  </Typography>
                </Box>
              </Box>

              <Box mt={2}>
                <Typography variant="h6" gutterBottom>
                  {selectedEvent.title}
                </Typography>
                <Typography variant="body1">
                  <strong>Owner:</strong> {selectedEvent.petOwner}
                </Typography>
                <Typography variant="body1">
                  <strong>Pet:</strong> {selectedEvent.petName} (
                  {selectedEvent.petSpecies})
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
            variant="contained"
            disabled={selectedEvent?.status === "Accepted"}
          >
            Accept
          </Button>
          <Button
            onClick={handleOpenDeclineDialog}
            color="secondary"
            variant="contained"
            disabled={selectedEvent?.status === "Accepted"}
          >
            Decline
          </Button>
          <Button onClick={handleCloseViewDialog} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </StyledDialog>

      <Dialog
        open={openDeclineDialog}
        onClose={() => setOpenDeclineDialog(false)}
      >
        <DialogTitle>Decline Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to decline this appointment?
          </Typography>
          <TextField
            label="Reason for Decline"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDecline}
            color="secondary"
            variant="contained"
            disabled={!declineReason.trim()}
          >
            Decline
          </Button>
          <Button
            onClick={() => setOpenDeclineDialog(false)}
            variant="outlined"
            color="primary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() =>
          setNotification({ open: false, message: "", severity: "info" })
        }
      >
        <Alert
          onClose={() =>
            setNotification({ open: false, message: "", severity: "info" })
          }
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
