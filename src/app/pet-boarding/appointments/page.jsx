"use client";
import React, { useState, useEffect, useCallback } from "react";
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    boxShadow: theme.shadows[1],
    minHeight: "400px", // Minimum height for smaller screens

    [theme.breakpoints.down("sm")]: {
      fontSize: "0.8rem",
    },
  },
  "& .rbc-header": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(1),

    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0.5),
    },
  },
  "& .rbc-today": {
    backgroundColor: theme.palette.action.hover,
  },
  "& .rbc-event": {
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],

    [theme.breakpoints.down("sm")]: {
      padding: "2px",
      fontSize: "0.7rem",
    },
  },
  // Add responsive styles for the toolbar
  "& .rbc-toolbar": {
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "stretch",
      "& .rbc-toolbar-label": {
        margin: theme.spacing(1, 0),
      },
      "& .rbc-btn-group": {
        margin: theme.spacing(0.5, 0),
      },
    },
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
  const [showHistory, setShowHistory] = useState(false); // Toggle between calendar and history views
  const [userRole, setUserRole] = useState(""); // Added userRole state
  const historyEvents = events.filter((event) =>
    event.status.includes("Accepted")
  );
  // Create a theme instance
  const theme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#2196f3", // Blue
      },
      secondary: {
        main: "#f50057", // Pink
      },
      background: {
        default: "#f5f5f5",
        paper: "#ffffff",
      },
    },
  });

  // Custom event styles
  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: event.status.includes("Done")
        ? theme.palette.grey[500] // Grey color for done appointments
        : event.status.includes("Accepted")
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

  // Cache owner details to prevent redundant API calls
  const ownerDetailsCache = new Map();

  const constructAvatarUrl = (avatarId) => {
    if (!avatarId) return "/placeholder.svg";
    return avatarId.startsWith("http")
      ? avatarId
      : `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.bucketId}/files/${avatarId}/view?project=${appwriteConfig.projectId}`;
  };

  const getOwnerDetails = async (ownerId) => {
    if (!ownerId) {
      return {
        ownerName: "Unknown Owner",
        ownerAvatar: "/placeholder.svg",
        phone: "N/A",
        email: "N/A",
      };
    }

    // Check cache first
    if (ownerDetailsCache.has(ownerId)) {
      return ownerDetailsCache.get(ownerId);
    }

    try {
      const response = await databases.listDocuments(dbId, usersCollId, [
        Query.equal("accountId", ownerId),
        Query.limit(1),
      ]);

      const details =
        response.total === 0
          ? {
              ownerName: "Unknown Owner",
              ownerAvatar: "/placeholder.svg",
              phone: "N/A",
              email: "N/A",
            }
          : {
              ownerName: response.documents[0].name || "Unknown Owner",
              ownerAvatar: response.documents[0].avatar
                ? constructAvatarUrl(response.documents[0].avatar)
                : "/placeholder.svg",
              phone: response.documents[0].phone || "N/A",
              email: response.documents[0].email || "N/A",
            };

      // Cache the result
      ownerDetailsCache.set(ownerId, details);
      return details;
    } catch (error) {
      console.error(`Error fetching owner for accountId ${ownerId}:`, error);
      return {
        ownerName: "Unknown Owner",
        ownerAvatar: "/placeholder.svg",
        phone: "N/A",
        email: "N/A",
      };
    }
  };

  const parseDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const parseTime = (time) => {
    if (!time) return "N/A";

    try {
      // Create a moment object from the time string
      const momentTime = moment(time, ["h:mm A", "HH:mm"]); // Adjust formats as needed

      // Check if the moment object is valid
      if (!momentTime.isValid()) {
        return "Invalid time";
      }

      // Convert to the desired timezone and format
      return momentTime.tz("Asia/Manila").format("h:mm A");
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid time";
    }
  };

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Get current user
      const currentUser = await account.get();
      console.log("Current user:", currentUser);

      // Fetch user details from your users collection
      const userResponse = await databases.listDocuments(
        dbId,
        appwriteConfig.userCollectionId,
        [Query.equal("accountId", currentUser.$id), Query.limit(1)]
      );

      console.log("User database response:", userResponse);

      if (!userResponse.documents.length) {
        setError("User details not found. Please contact support.");
        return;
      }

      // Get the role from the user document
      const userDoc = userResponse.documents[0];
      let userRole = userDoc.role || "";
      console.log("Found role in database:", userRole);

      // Clean up the role string
      userRole = userRole.toString().toLowerCase().trim();
      console.log("Processed role:", userRole);

      // Get clinic number
      const clinicNumber = userRole.match(/\d+/)?.[0];
      if (!clinicNumber) {
        setError(`Invalid clinic role format. Current role: ${userRole}`);
        setEvents([]);
        return;
      }

      const clinicFilter = `Clinic ${clinicNumber}`;
      console.log("Using clinic filter:", clinicFilter);

      // Debug log the query parameters
      console.log("Database ID:", databaseId || dbId);
      console.log("Collection ID:", collectionId || petCollId);
      console.log("Clinic Filter:", clinicFilter);

      // Fetch appointments
      const response = await databases.listDocuments(
        databaseId || dbId,
        collectionId || petCollId,
        [Query.equal("petClinic", clinicFilter)]
      );

      console.log("Appointments response:", response);

      if (!response.documents?.length) {
        console.log("No appointments found for clinic:", clinicFilter);
        setEvents([]);
        return;
      }

      // Process appointments
      const processedEvents = await Promise.all(
        response.documents.map(async (appointment) => {
          console.log("Processing appointment:", appointment);

          const ownerDetails = appointment.ownerId
            ? await getOwnerDetails(appointment.ownerId)
            : {
                ownerName: "Unknown Owner",
                ownerAvatar: "/placeholder.svg",
                email: "N/A",
              };

          const appointmentDateTime = appointment.petDate[0];
          const startTime = new Date(appointmentDateTime);
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

          return {
            id: appointment.$id,
            title: appointment.petServices || "No Title",
            petOwner: ownerDetails.ownerName,
            petName: appointment.petName || "Unknown Pet",
            petSpecies: appointment.petSpecies || "Unknown Species",
            petPhotoId:
              appointment.petPhotoId ||
              appointment.petPhoto ||
              appointment.photoId,
            petAvatar: constructAvatarUrl(
              appointment.petPhotoId ||
                appointment.petPhoto ||
                appointment.photoId
            ),
            userAvatar: ownerDetails.ownerAvatar,
            date: parseDate(appointmentDateTime),
            time: parseTime(moment(appointmentDateTime).format("HH:mm")),
            start: startTime,
            end: endTime,
            status: appointment.status || "Pending",
            email: ownerDetails.email,
          };
        })
      );

      console.log("Processed events:", processedEvents);
      setEvents(processedEvents);
    } catch (error) {
      console.error("Error in fetchAppointments:", error);
      setError(`Failed to fetch appointments: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [databaseId, collectionId, userRole]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const filteredEvents = events.filter((event) => {
    if (view === "agenda") {
      // Show only "Accepted" appointments that are not "Done" in agenda view
      return Array.isArray(event.status)
        ? event.status.includes("Accepted") && !event.status.includes("Done")
        : event.status === "Accepted" && event.status !== "Done";
    }

    // For calendar view: Exclude "Accepted", "Declined", and "Done" appointments
    if (Array.isArray(event.status)) {
      return (
        !event.status.includes("Accepted") &&
        !event.status.includes("Declined") &&
        !event.status.includes("Done")
      );
    }
    return (
      event.status !== "Accepted" &&
      event.status !== "Declined" &&
      event.status !== "Done"
    );
  });

  const handleSelectEvent = useCallback(async (event) => {
    try {
      const ownerDetails = await getOwnerDetails(event.ownerId);
      setSelectedEvent({
        ...event,
        ownerDetails,
      });
      setOpenViewDialog(true);
    } catch (error) {
      console.error("Error fetching owner details:", error);
      toast.error("Failed to fetch owner details");
    }
  }, [dbId, getOwnerDetails, petCollId]);

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedEvent(null);
  };

  const showNotification = (message, severity = "info") => {
    switch (severity) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "warning":
        toast.warning(message);
        break;
      default:
        toast.info(message);
    }
  };

  // Accepted Appointment
  const handleAccept = async () => {
    try {
      if (!selectedEvent) {
        throw new Error("No event selected");
      }

      const { title, petOwner, date, time, email } = selectedEvent;

      if (!email || email === "N/A") {
        throw new Error("No valid email address found for the pet owner");
      }

      console.log("Sending email to:", email); // Debug log

      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: "Pet Care Appointment Accepted",
          text: `Your appointment for ${title} has been accepted!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #4CAF50; text-align: center;">Appointment Accepted</h1>
              <p>Dear ${petOwner},</p>
              <p>Your appointment for <strong>${title}</strong> has been accepted!</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Appointment Details:</strong></p>
                <p>Service: ${title}</p>
                <p>Date: ${date}</p>
                <p>Time: ${time}</p>
              </div>
              <p>Thank you for choosing our services!</p>
            </div>
          `,
        }),
      });

      const data = await emailResponse.json();
      console.log("Email API response:", data); // Debug log

      if (!emailResponse.ok) {
        throw new Error(data.details || data.error || "Failed to send email");
      }

      // Update appointment status
      await databases.updateDocument(dbId, petCollId, selectedEvent.id, {
        status: ["Accepted"],
        status_reading: "unread",
      });

      showNotification(
        "Appointment accepted and confirmation email sent",
        "success"
      );
      fetchAppointments();
      handleCloseViewDialog();
    } catch (error) {
      console.error("Error in handleAccept:", error);
      showNotification(
        `Failed to process appointment: ${error.message}`,
        "error"
      );
    }
  };

  // Decline Appointment
  const handleDecline = async () => {
    try {
      if (!selectedEvent) {
        throw new Error("No event selected");
      }

      const { title, petOwner, date, time, email } = selectedEvent;

      if (!email || email === "N/A") {
        throw new Error("No valid email address found for the pet owner");
      }

      // Send decline email notification
      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "Pet Care Appointment Declined",
          text: `Your appointment for ${title} has been declined.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #f44336; text-align: center;">Appointment Declined</h1>
              <p>Dear ${petOwner},</p>
              <p>We regret to inform you that your appointment for <strong>${title}</strong> has been declined.</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Appointment Details:</strong></p>
                <p>Service: ${title}</p>
                <p>Date: ${date}</p>
                <p>Time: ${time}</p>
                ${
                  declineReason
                    ? `<p><strong>Reason:</strong> ${declineReason}</p>`
                    : ""
                }
              </div>
              <p>If you have any questions, please don't hesitate to contact us.</p>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const data = await emailResponse.json();
        throw new Error(data.details || data.error || "Failed to send email");
      }

      // Update appointment status
      await databases.updateDocument(dbId, petCollId, selectedEvent.id, {
        status: ["Declined"],
        declineReason: [declineReason],
      });

      showNotification("Appointment declined and notification sent", "warning");
      fetchAppointments();
      setOpenDeclineDialog(false);
      handleCloseViewDialog();
    } catch (error) {
      console.error("Error declining appointment:", error);
      showNotification(
        `Failed to decline appointment: ${error.message}`,
        "error"
      );
    }
  };
  const handleOpenDeclineDialog = () => {
    setOpenDeclineDialog(true);
  };
  useEffect(() => {
    if (selectedEvent) {
      console.log("Selected Event Details:", {
        petPhotoId: selectedEvent.petPhotoId,
        petAvatar: selectedEvent.petAvatar,
        appointmentDetails,
      });
    }
  }, [selectedEvent, appointmentDetails]);

  // Handle Mark as Done
  const handleMarkAsDone = async () => {
    try {
      if (!selectedEvent) {
        throw new Error("No event selected");
      }

      const { title, petOwner, date, time, email } = selectedEvent;

      if (!email || email === "N/A") {
        throw new Error("No valid email address found for the pet owner");
      }

      // Send completion email notification
      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "Pet Care Appointment Completed",
          text: `Your appointment for ${title} has been completed.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #4CAF50; text-align: center;">Appointment Completed</h1>
              <p>Dear ${petOwner},</p>
              <p>Your appointment for <strong>${title}</strong> has been completed.</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Appointment Details:</strong></p>
                <p>Service: ${title}</p>
                <p>Date: ${date}</p>
                <p>Time: ${time}</p>
                ${
                  doneNotes ? `<p><strong>Notes:</strong> ${doneNotes}</p>` : ""
                }
              </div>
              <p>Thank you for choosing our services!</p>
              <p>We look forward to serving you again.</p>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const data = await emailResponse.json();
        throw new Error(data.details || data.error || "Failed to send email");
      }

      // Update appointment status
      await databases.updateDocument(dbId, petCollId, selectedEvent.id, {
        status: ["Done"],
        doneNotes: [doneNotes],
      });

      showNotification(
        "Appointment marked as done and notification sent",
        "success"
      );
      fetchAppointments();
      setOpenDoneDialog(false);
      handleCloseViewDialog();
      setDoneNotes(""); // Reset the notes
    } catch (error) {
      console.error("Error marking appointment as done:", error);
      showNotification(
        `Failed to mark appointment as done: ${error.message}`,
        "error"
      );
    }
  };

  // Add this new state near your other useState declarations
  const [doneNotes, setDoneNotes] = useState("");
  const [openDoneDialog, setOpenDoneDialog] = useState(false);

  // Add this new handler function
  const handleOpenDoneDialog = () => {
    setOpenDoneDialog(true);
  };

  // Add this state for dialog control
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          p: { xs: 1, sm: 2, md: 3 },
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          mb={2}
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Button
            variant={showHistory ? "outlined" : "contained"}
            color="primary"
            onClick={() => setShowHistory(false)}
            fullWidth={false}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Calendar View
          </Button>
          <Button
            variant={showHistory ? "contained" : "outlined"}
            color="secondary"
            onClick={() => setShowHistory(true)}
            fullWidth={false}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            History
          </Button>
        </Box>

        {/* Update Calendar height to be responsive */}
        {!showHistory && (
          <StyledCalendarWrapper>
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              style={{
                height: {
                  xs: 300, // Mobile
                  sm: 400, // Tablet
                  md: view === "month" ? 450 : 400, // Desktop: 450px for month view, 400px for week/day views
                },
              }}
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
          </StyledCalendarWrapper>
        )}

        {/* Make dialogs more responsive */}
        <StyledDialog
          open={openViewDialog}
          onOpenChange={(open) => setOpenViewDialog(open)}
          defaultOpen={false}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogContent>
            {selectedEvent && (
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "center", sm: "start" }}
                gap={2}
              >
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
                      sx={{
                        width: 80,
                        height: 80,
                        marginBottom: 1,
                        bgcolor: "grey.300", // Add a background color for empty state
                      }}
                      onError={(e) => {
                        console.error(
                          "Error loading pet avatar:",
                          appointmentDetails.petAvatar
                        );
                        e.target.src = "/placeholder.svg";
                      }}
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
                    <strong>Email:</strong> {selectedEvent.email}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Pet:</strong> {selectedEvent.petName} (
                    {selectedEvent.petSpecies})
                  </Typography>
                  <Typography variant="body1">
                    <strong>Date:</strong>{" "}
                    {selectedEvent.date
                      ? moment
                          .tz(selectedEvent.date, "Asia/Manila")
                          .format("MMMM D, YYYY")
                      : "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Time:</strong>{" "}
                    {selectedEvent.time ? parseTime(selectedEvent.time) : "N/A"}
                  </Typography>
                  <Typography variant="body1" color="primary" mt={2}>
                    <strong>Status:</strong> {selectedEvent.status}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            {view === "agenda" ? (
              <>
                <Button
                  onClick={handleOpenDoneDialog}
                  color="primary"
                  variant="contained"
                  disabled={selectedEvent?.status === "Done"}
                >
                  Mark as Done
                </Button>
                {selectedEvent?.status === "Done" && (
                  <Typography variant="body2" color="success.main">
                    This appointment has been completed
                  </Typography>
                )}
              </>
            ) : (
              <>
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
              </>
            )}
            <Button onClick={handleCloseViewDialog} variant="outlined">
              Close
            </Button>
          </DialogActions>
        </StyledDialog>

        <Dialog
          open={openDeclineDialog}
          onOpenChange={(open) => setOpenDeclineDialog(open)}
          defaultOpen={false}
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

        <Dialog
          open={openDoneDialog}
          onOpenChange={(open) => setOpenDoneDialog(open)}
          defaultOpen={false}
        >
          <DialogTitle>Mark Appointment as Done</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Add any notes about the completed appointment:
            </Typography>
            <TextField
              label="Completion Notes"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={doneNotes}
              onChange={(e) => setDoneNotes(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleMarkAsDone}
              color="primary"
              variant="contained"
              disabled={!doneNotes.trim()}
            >
              Complete
            </Button>
            <Button
              onClick={() => setOpenDoneDialog(false)}
              variant="outlined"
              color="primary"
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add the ToastContainer */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={true}
          closeOnClick
        />
      </Box>
    </ThemeProvider>
  );
}
