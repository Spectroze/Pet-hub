"use client";

import React, { useState } from "react";
import { BellIcon, CheckIcon, Trash2Icon, XIcon } from "lucide-react";
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

const notifications = [
  {
    id: 1,
    type: "Appointment",
    message: "Vet appointment tomorrow",
    date: "2024-10-15",
    status: "Unread",
    details:
      "Your pet has a scheduled vet appointment tomorrow at 2:00 PM. Please ensure you arrive 10 minutes early.",
  },
  {
    id: 2,
    type: "Reminder",
    message: "Monthly grooming session",
    date: "2024-10-10",
    status: "Read",
    details:
      "Don't forget to book your pet's monthly grooming session. Regular grooming helps maintain your pet's health and appearance.",
  },
  {
    id: 3,
    type: "Alert",
    message: "Vaccination due next week",
    date: "2024-10-08",
    status: "Unread",
    details:
      "Your pet's vaccination is due next week. Please schedule an appointment with your veterinarian to ensure your pet stays protected.",
  },
];

export default function Notifications() {
  const [data, setData] = useState(notifications);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const markAsRead = (id) => {
    const updatedData = data.map((notification) =>
      notification.id === id
        ? { ...notification, status: "Read" }
        : notification
    );
    setData(updatedData);
  };

  const deleteNotification = (id) => {
    setData(data.filter((notification) => notification.id !== id));
    setIsModalOpen(false);
  };

  const openNotificationModal = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (notification.status === "Unread") {
      markAsRead(notification.id);
    }
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
              <TableCell className="font-bold text-purple-100">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((notification) => (
              <TableRow
                key={notification.id}
                className={`${
                  notification.status === "Unread"
                    ? "bg-purple-800"
                    : "bg-gray-800"
                } hover:bg-purple-700 transition cursor-pointer`}
                onClick={() => openNotificationModal(notification)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <BellIcon className="w-5 h-5 text-purple-300" />
                    {notification.type}
                  </div>
                </TableCell>
                <TableCell>{notification.message}</TableCell>
                <TableCell>{notification.date}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      notification.status === "Unread"
                        ? "bg-yellow-600 text-yellow-100"
                        : "bg-green-600 text-green-100"
                    }`}
                  >
                    {notification.status}
                  </span>
                </TableCell>
                <TableCell className="flex gap-2">
                  {notification.status === "Unread" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-purple-700 text-purple-100 hover:bg-purple-600 border-purple-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      <CheckIcon className="w-4 h-4 mr-1" /> Mark as Read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="bg-red-700 hover:bg-red-600 text-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <Trash2Icon className="w-4 h-4 mr-1" /> Delete
                  </Button>
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
                  {selectedNotification.type}
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  {selectedNotification.message}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-purple-400 mb-2">
                  Date: {selectedNotification.date}
                </p>
                <p className="text-sm mb-4 text-gray-300">
                  {selectedNotification.details}
                </p>
                <p className="text-sm font-semibold text-gray-200">
                  Status:{" "}
                  <span
                    className={`px-2 py-1 rounded ${
                      selectedNotification.status === "Unread"
                        ? "bg-yellow-600 text-yellow-100"
                        : "bg-green-600 text-green-100"
                    }`}
                  >
                    {selectedNotification.status}
                  </span>
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="bg-gray-700 text-gray-200 hover:bg-gray-600 border-purple-500"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  className="bg-red-700 hover:bg-red-600 text-gray-100"
                  onClick={() => deleteNotification(selectedNotification.id)}
                >
                  <Trash2Icon className="w-4 h-4 mr-1" /> Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
