"use client";
import React, { useState, useEffect } from "react";
import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Query, Account, Client } from "appwrite";
import { appwriteConfig, databases } from "../../../lib/appwrite";

// Initialize Appwrite Client
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67094c000023e950be96");

// Set the client to the appwriteConfig object
appwriteConfig.client = client;

// Initialize the Appwrite Account object using the configured client
const account = new Account(client);

export default function Notifications() {
  const [data, setData] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch appointment details for the logged-in user
  const fetchAppointments = async () => {
    try {
      // Get the logged-in user's details
      const user = await account.get();
      const userId = user.$id;

      // Fetch only the logged-in user's appointments
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        "670ab2db00351bc09a92", // Use the petCollectionId
        [Query.equal("ownerId", userId), Query.orderDesc("$updatedAt")]
      );

      setData(response.documents || []);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const openNotificationModal = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full max-w-8xl mx-auto bg-gray-900 shadow-lg rounded-lg p-6 text-gray-100">
      <h2 className="text-3xl font-semibold mb-6 text-purple-300">
        Notifications
      </h2>
      <div className="overflow-auto rounded-lg border border-gray-700">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-purple-900">
              <TableCell className="font-bold text-purple-100">Type</TableCell>
              <TableCell className="font-bold text-purple-100">
                Message
              </TableCell>
              <TableCell className="font-bold text-purple-100">Date</TableCell>
              <TableCell className="font-bold text-purple-100">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((notification) => (
              <TableRow
                key={notification.$id}
                className="hover:bg-purple-700 transition cursor-pointer"
                onClick={() => openNotificationModal(notification)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <BellIcon className="w-5 h-5 text-purple-300" />
                    {notification.type || "Appointment"}
                  </div>
                </TableCell>
                <TableCell>
                  {Array.isArray(notification.status) &&
                  notification.status[0]?.toLowerCase() === "accepted"
                    ? "Your appointment is accepted"
                    : Array.isArray(notification.status) &&
                      notification.status[0]?.toLowerCase() === "declined"
                    ? "Your appointment is declined"
                    : notification.message || "Appointment Update"}
                </TableCell>

                <TableCell>{notification.$updatedAt || "N/A"}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded text-sm">
                    {notification.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-800 text-gray-100 border border-purple-500">
          {selectedNotification && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-purple-300">
                  {selectedNotification.type || "Appointment"}
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  {Array.isArray(selectedNotification.status) &&
                  selectedNotification.status[0]?.toLowerCase() === "accepted"
                    ? "Your appointment is accepted"
                    : Array.isArray(selectedNotification.status) &&
                      selectedNotification.status[0]?.toLowerCase() ===
                        "declined"
                    ? "Your appointment is declined"
                    : selectedNotification.message || "Appointment Update"}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-purple-400 mb-2">
                  Date: {selectedNotification.$updatedAt || "N/A"}
                </p>
                <p className="text-sm font-semibold text-gray-200">
                  Status: <span>{selectedNotification.status}</span>
                </p>
                {Array.isArray(selectedNotification.status) &&
                  selectedNotification.status[0]?.toLowerCase() ===
                    "declined" && (
                    <p className="text-sm text-red-400 mt-2">
                      <strong>Reason for Decline:</strong>{" "}
                      {selectedNotification.declineReason ||
                        "No reason provided."}
                    </p>
                  )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="bg-gray-700 text-gray-200 hover:bg-gray-600 border-purple-500"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
