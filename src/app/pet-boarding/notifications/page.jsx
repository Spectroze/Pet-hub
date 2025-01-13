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
import { databases, account, appwriteConfig } from "@/lib/appwrite";
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
  const [unreadCount, setUnreadCount] = useState(0); // Holds count of unread notifications
  const [selectedNotification, setSelectedNotification] = useState(null); // Selected notification for the modal
  const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility
  const [loading, setLoading] = useState(false); // State to track loading status
  const [error, setError] = useState(null); // State to track any errors
  const [userRole, setUserRole] = useState(""); // State to store user role
  const [userClinic, setUserClinic] = useState(""); // Add this new state

  const fetchUserRole = async () => {
    let fetchedRole = "clinic"; // Default role
    let fetchedClinic = ""; // Store clinic number
    try {
      const user = await account.get();

      // First check user preferences
      if (user.prefs && user.prefs.role) {
        fetchedRole = user.prefs.role.toLowerCase();
        fetchedClinic = user.prefs.clinic || ""; // Get clinic from prefs if exists
      }

      try {
        // Try to get user document
        const userDoc = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          user.$id
        );
        if (userDoc.role) {
          fetchedRole = userDoc.role.toLowerCase();
        }
        if (userDoc.clinic) {
          fetchedClinic = userDoc.clinic; // Get clinic from user document
        }
      } catch (docError) {
        console.warn("User document not found, using default values");
      }

      setUserRole(fetchedRole);
      setUserClinic(fetchedClinic);
      return { role: fetchedRole, clinic: fetchedClinic };
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to fetch user data. Please try again.");
      setUserRole(fetchedRole);
      setUserClinic(fetchedClinic);
      return { role: fetchedRole, clinic: fetchedClinic };
    }
  };

  const fetchUnreadCount = async (role, clinic) => {
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.equal("status_reading", "unread"),
        Query.equal("petServices", getServiceByRole(role)),
      ];

      // Add clinic-specific filter if role is clinic and clinic is specified
      if (role === "clinic" && clinic) {
        queries.push(Query.equal("petClinic", clinic));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId,
        queries
      );
      setUnreadCount(response.total);
    } catch (error) {
      setError("Failed to fetch unread notifications count. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getServiceByRole = (role) => {
    // Handle null/undefined roles
    if (!role) {
      console.error("No role provided");
      return "Pet Veterinary";
    }

    // Split roles if multiple are provided and get the first one
    const primaryRole = role.split(",")[0].trim().toLowerCase();

    // Check if the role matches pattern "clinic #" (where # is 1-10)
    const clinicMatch = primaryRole.match(/^clinic\s*(\d+)$/);
    if (
      clinicMatch &&
      Number(clinicMatch[1]) >= 1 &&
      Number(clinicMatch[1]) <= 10
    ) {
      return "Pet Veterinary";
    }

    switch (primaryRole) {
      case "clinic":
        return "Pet Veterinary";
      case "pet-boarding":
        return "Pet Boarding";
      case "pet training":
      case "pet-training":
        return "Pet Training";
      default:
        console.error("Invalid role received:", role);
        return "Pet Veterinary"; // Default to Pet Veterinary if role is invalid
    }
  };

  const fetchAppointments = async (role, clinic) => {
    setLoading(true);
    setError(null);
    setNotifications([]); // Clear existing data
    try {
      const service = getServiceByRole(role);
      if (!service) {
        setError("Invalid user role. Please contact support.");
        return;
      }

      const queries = [
        Query.equal("petServices", service),
        Query.orderDesc("$updatedAt"),
      ];

      // Add clinic-specific filter if role is clinic and clinic is specified
      if (role === "clinic" && clinic) {
        queries.push(Query.equal("petClinic", clinic));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId,
        queries
      );
      if (response.documents.length > 0) {
        const mappedNotifications = response.documents.map((doc) => ({
          id: doc.$id,
          type: doc.type || "Appointment",
          message:
            doc.message || `New Appointment for ${doc.petServices || "N/A"}`,
          scheduledDate: formatDateToReadable(doc.$updatedAt),
          scheduledTime: formatDateToReadable(doc.petTime || ""),
          realTime: doc.$updatedAt,
          service: doc.petServices || "N/A",
          isRead: doc.status_reading === "read",
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

  useEffect(() => {
    const initializeData = async () => {
      const userData = await fetchUserRole();
      if (userData.role) {
        await fetchUnreadCount(userData.role, userData.clinic);
        await fetchAppointments(userData.role, userData.clinic);
      }
    };

    initializeData();
  }, []);

  const openNotificationModal = async (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId,
        notification.id,
        { status_reading: "read" }
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notification.id ? { ...notif, isRead: true } : notif
        )
      );

      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Failed to update notification status:", error);
    }
  };

  return (
    <div className="w-full max-w-8xl mx-auto bg-[#FAF5E6] shadow-lg rounded-lg p-6 text-[#2D2C2E]">
      <h2 className="text-3xl font-semibold mb-6 text-[#2D2C2E] flex items-center gap-2">
        <BellIcon className="h-8 w-8 text-[#FBBD0D]" />
        Notifications
        {unreadCount > 0 && (
          <span className="ml-2 px-3 py-1 text-sm bg-[#FD1F4A] text-white rounded-full">
            {unreadCount}
          </span>
        )}
      </h2>
      {loading && (
        <p className="text-[#2D2C2E]/70 text-center">
          Loading notifications...
        </p>
      )}
      {error && <p className="text-[#FD1F4A] text-center">{error}</p>}
      {!loading && notifications.length === 0 && !error && (
        <p className="text-[#2D2C2E]/70 text-center">
          No notifications available.
        </p>
      )}
      {notifications.length > 0 && (
        <div className="overflow-auto rounded-lg border border-[#FBBD0D]/20">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-[#FAF5E6] border-b border-[#FBBD0D]/20">
                <TableCell className="font-bold text-[#2D2C2E]">Type</TableCell>
                <TableCell className="font-bold text-[#2D2C2E]">
                  Message
                </TableCell>
                <TableCell className="font-bold text-[#2D2C2E]">Date</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow
                  key={notification.id}
                  className={`${
                    notification.isRead
                      ? "bg-white hover:bg-[#FAF5E6]/80"
                      : isNewNotification(notification.realTime)
                      ? "bg-gray-200 hover:bg-gray-300"
                      : "bg-[#FBBD0D]/10 hover:bg-[#FBBD0D]/20"
                  } transition-colors cursor-pointer border-b border-[#FBBD0D]/10`}
                  onClick={() => openNotificationModal(notification)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BellIcon className="w-5 h-5 text-[#FBBD0D]" />
                      <span className="font-medium">
                        {notification.type || "Appointment"}
                      </span>
                      {!notification.isRead &&
                        isNewNotification(notification.realTime) && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold bg-[#FD1F4A] text-white rounded-full">
                            New
                          </span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-[#2D2C2E]/80">
                    {notification.message || "No message"}
                  </TableCell>
                  <TableCell className="text-[#2D2C2E]/80">
                    {notification.scheduledDate || "No date available"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#FAF5E6] text-[#2D2C2E] border border-[#FBBD0D]/20">
          {selectedNotification && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#2D2C2E] font-bold">
                  {selectedNotification.type || "Notification"}
                </DialogTitle>
                <DialogDescription className="text-[#2D2C2E]/70">
                  {selectedNotification.message || "No details available"}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-[#2D2C2E] font-bold">
                    Service:
                  </span>
                  <span className="text-[#2D2C2E]/70">
                    {selectedNotification.service || "No service"}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-[#2D2C2E] font-bold">
                    Date:
                  </span>
                  <span className="text-[#2D2C2E]/70">
                    {selectedNotification.scheduledDate || "No date"}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <button
                  className="px-4 py-2 bg-[#FBBD0D] hover:bg-[#FBBD0D]/90 text-[#2D2C2E] rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setIsModalOpen(false)}
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
