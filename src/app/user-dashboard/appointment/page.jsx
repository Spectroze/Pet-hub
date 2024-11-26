"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Client, Databases, Account, Query, ID } from "appwrite";
import NewAppointmentModal from "@/app/modals/newAppointmentModal";
import { toast } from "react-toastify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Clipboard, MapPin, DollarSign } from "lucide-react";

const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "67094c000023e950be96",
  databaseId: "670a040f000893eb8e06",
  petCollectionId: "670ab2db00351bc09a92",
};

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

const databases = new Databases(client);
const account = new Account(client);

export default function Appointment() {
  const [appointments, setAppointments] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] =
    useState(false);

  const openNewAppointmentModal = () => setIsNewAppointmentModalOpen(true);
  const closeNewAppointmentModal = () => setIsNewAppointmentModalOpen(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    getCurrentUser();
  }, []);

  const fetchAppointments = async () => {
    if (!userId) return;

    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId,
        [Query.equal("ownerId", userId)]
      );

      setAppointments(response.documents || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [userId]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "N/A";

    try {
      const dateTime = new Date(time);
      const hours = dateTime.getUTCHours();
      const minutes = dateTime.getUTCMinutes();

      return new Intl.DateTimeFormat("en-PH", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(new Date(Date.UTC(1970, 0, 1, hours, minutes)));
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid time";
    }
  };

  const handleCreateAppointment = async (appointmentData) => {
    try {
      const newAppointment = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId,
        ID.unique(),
        {
          ...appointmentData,
          ownerId: userId,
        }
      );

      toast.success("Appointment created successfully!");
      setAppointments((prevAppointments) => [
        ...prevAppointments,
        newAppointment,
      ]);
      closeNewAppointmentModal();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to create appointment.");
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-gray-100 min-h-screen">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-100">
          Your Pet's Appointments
        </CardTitle>
      </CardHeader>

      <div className="overflow-x-auto shadow-lg shadow-blue-500/20 rounded-lg">
        <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-750">
              <th className="px-4 py-2 border border-gray-600 text-left text-gray-300">
                Pet Name
              </th>
              <th className="px-4 py-2 border border-gray-600 text-left text-gray-300">
                Service
              </th>
              <th className="px-4 py-2 border border-gray-600 text-left text-gray-300">
                Date
              </th>
              <th className="px-4 py-2 border border-gray-600 text-left text-gray-300">
                Time
              </th>
              <th className="px-4 py-2 border border-gray-600 text-left text-gray-300">
                Clinic
              </th>
              <th className="px-4 py-2 border border-gray-600 text-left text-gray-300">
                Room
              </th>
              <th className="px-4 py-2 border border-gray-600 text-left text-gray-300">
                Payment
              </th>
              <th className="px-4 py-2 border border-gray-600 text-left text-gray-300">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <tr
                  key={appointment.$id}
                  className="hover:bg-gray-750 transition-colors duration-150"
                >
                  <td className="px-4 py-2 border border-gray-600 text-gray-300">
                    {appointment.petName || "N/A"}
                  </td>
                  <td className="px-4 py-2 border border-gray-600 text-gray-300">
                    {Array.isArray(appointment.petServices)
                      ? appointment.petServices[0] || "N/A"
                      : appointment.petServices || "N/A"}
                  </td>
                  <td className="px-4 py-2 border border-gray-600 text-gray-300">
                    {formatDate(appointment.petDate)}
                  </td>
                  <td className="px-4 py-2 border border-gray-600 text-gray-300">
                    {formatTime(appointment.petTime)}
                  </td>
                  <td className="px-4 py-2 border border-gray-600 text-gray-300">
                    {appointment.petClinic || "N/A"}
                  </td>
                  <td className="px-4 py-2 border border-gray-600 text-gray-300">
                    {appointment.petRoom || "N/A"}
                  </td>
                  <td className="px-4 py-2 border border-gray-600 text-gray-300">
                    {appointment.petPayment || "N/A"} ₱
                  </td>
                  <td className="px-4 py-2 border border-gray-600 text-gray-300">
                    {appointment.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-4 py-2 border border-gray-600 text-center text-gray-300"
                  colSpan="7"
                >
                  No appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
