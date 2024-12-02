"use client";

import React, { useState, useEffect } from "react";
import { BellIcon } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { databases, account, appwriteConfig } from "@/lib/appwrite"; // Import Appwrite config and APIs
import { Query } from "appwrite";

// Function to format date and time to readable format
const formatDateToReadable = (dateString) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // 12-hour format with AM/PM
  });
};

// Function to check if a notification is new (within 24 hours)
const isNewNotification = (notificationDate) => {
  const now = new Date();
  const notificationTime = new Date(notificationDate);
  const timeDifference = now - notificationTime; // Difference in milliseconds
  const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
  return timeDifference <= oneDay; // Check if within 24 hours
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]); // Holds notification data
  const [selectedNotification, setSelectedNotification] = useState(null); // Selected notification for the modal
  const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility
  const [loading, setLoading] = useState(false); // State to track loading status
  const [error, setError] = useState(null); // State to track any errors

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = await account.get();
      const userId = user.$id; // Logged-in user ID

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        "670ab2db00351bc09a92", // Replace with your collection ID
        [
          Query.equal("petServices", ["Veterinary Care", "Pet Grooming"]),
          Query.orderDesc("$updatedAt"),
        ] // Fetch only pet training services
      );

      if (response.documents.length > 0) {
        const mappedNotifications = response.documents.map((doc) => ({
          id: doc.$id,
          type: doc.type || "Appointment",
          message:
            doc.message || `New Appointment for ${doc.petServices || "N/A"}`,
          scheduledDate: formatDateToReadable(doc.$updatedAt), // Use $updatedAt for notification date
          scheduledTime: formatDateToReadable(doc.petTime || ""), // Scheduled time
          realTime: doc.$updatedAt, // Use raw date for comparison
          service: doc.petServices || "N/A", // Service type
          isRead: false, // Mark all notifications as unread initially
        }));

        setNotifications(mappedNotifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      setError("Failed to fetch notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  const openNotificationModal = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);

    // Mark the notification as read
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notification.id ? { ...notif, isRead: true } : notif
      )
    );
  };

  return (
    <div className="w-full max-w-8xl mx-auto bg-gray-900 shadow-lg rounded-lg p-6 text-gray-100">
      <h2 className="text-3xl font-semibold mb-6 text-purple-300">
        Notifications
      </h2>

      {/* Display loading, error, or no data message */}
      {loading && (
        <p className="text-gray-300 text-center">Loading notifications...</p>
      )}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loading && notifications.length === 0 && !error && (
        <p className="text-gray-300 text-center">No notifications available.</p>
      )}

      {/* Display notification table if notifications are available */}
      {notifications.length > 0 && (
        <div className="overflow-auto rounded-lg border border-gray-700">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-purple-900">
                <TableCell className="font-bold text-purple-100">
                  Type
                </TableCell>
                <TableCell className="font-bold text-purple-100">
                  Message
                </TableCell>
                <TableCell className="font-bold text-purple-100">
                  Date
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow
                  key={notification.id}
                  className={`bg-gray-800 ${
                    !notification.isRead &&
                    isNewNotification(notification.realTime)
                      ? "bg-green-700" // Highlight new notifications
                      : "hover:bg-purple-700"
                  } transition cursor-pointer`}
                  onClick={() => openNotificationModal(notification)} // Open modal with selected notification
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BellIcon className="w-5 h-5 text-purple-300" />
                      {notification.type || "Appointment"}
                      {!notification.isRead &&
                        isNewNotification(notification.realTime) && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold bg-green-500 text-gray-800 rounded-full">
                            New
                          </span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>{notification.message || "No message"}</TableCell>
                  <TableCell>
                    {notification.scheduledDate || "No date available"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal to display selected notification details */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-800 text-gray-100 border border-purple-500">
          {selectedNotification && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-purple-300">
                  {selectedNotification.type || "Notification"}
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  {selectedNotification.message || "No details available"}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {/* Service Badge */}
                <div className="flex gap-2 items-center mb-4">
                  <span className="text-sm text-purple-400 font-bold">
                    Service:
                  </span>
                  <span className="px-2 py-1 bg-purple-700 text-purple-100 rounded-full text-xs">
                    {selectedNotification.service}
                  </span>
                </div>
                {/* Scheduled Date and Time */}
                <p className="text-sm text-purple-400 mb-4">
                  <strong>Pet Scheduled:</strong>{" "}
                  {selectedNotification.scheduledTime || "N/A"}
                </p>
                {/* Real-Time Notification */}
                <p className="text-sm text-gray-300">
                  <strong>Notification Sent:</strong>{" "}
                  {formatDateToReadable(selectedNotification.realTime) || "N/A"}
                </p>
              </div>
              <DialogFooter>
                <button
                  className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600"
                  onClick={() => setIsModalOpen(false)} // Close modal
                >
                  Close
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
