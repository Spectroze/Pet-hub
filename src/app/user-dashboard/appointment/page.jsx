"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Client, Databases, Account, Query, ID } from "appwrite";
import NewAppointmentModal from "@/app/modals/newAppointmentModal";
import { toast } from "react-toastify";

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
      month: "2-digit",
      day: "2-digit",
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
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Appointments</h2>
        <p className="mb-6">Schedule and manage your pet care appointments.</p>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Pet Name</th>
                <th className="px-4 py-2 border">Service</th>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Time</th>
                <th className="px-4 py-2 border">Species</th>
                <th className="px-4 py-2 border">Age</th>
                <th className="px-4 py-2 border">Clinic</th>
                <th className="px-4 py-2 border">Room</th>
                <th className="px-4 py-2 border">Payment</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <tr key={appointment.$id}>
                    <td className="px-4 py-2 border">
                      {appointment.petName || "N/A"}
                    </td>
                    <td className="px-4 py-2 border">
                      {Array.isArray(appointment.petServices)
                        ? appointment.petServices[0] || "N/A"
                        : appointment.petServices || "N/A"}
                    </td>
                    <td className="px-4 py-2 border">
                      {formatDate(appointment.petDate)}
                    </td>
                    <td className="px-4 py-2 border">
                      {formatTime(appointment.petTime)}
                    </td>
                    <td className="px-4 py-2 border">
                      {appointment.petSpecies || "N/A"}
                    </td>
                    <td className="px-4 py-2 border">
                      {appointment.petAge || "N/A"}
                    </td>
                    <td className="px-4 py-2 border">
                      {appointment.petClinic || "N/A"}
                    </td>
                    <td className="px-4 py-2 border">
                      {appointment.petRoom || "N/A"}
                    </td>
                    <td className="px-4 py-2 border">
                      {appointment.petPayment || "N/A"} ₱
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-2 border text-center" colSpan="9">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book New Appointment Button */}
      <Button className="w-full" onClick={openNewAppointmentModal}>
        Book New Appointment
      </Button>

      {/* Render NewAppointmentModal */}
      <NewAppointmentModal
        isOpen={isNewAppointmentModalOpen}
        onClose={closeNewAppointmentModal}
        onCreateAppointment={handleCreateAppointment} // Pass the handleCreateAppointment function
      />
    </div>
  );
}
