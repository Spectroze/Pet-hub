"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Client, Databases, Account, Query } from "appwrite";
import { toast } from "react-toastify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FaEye } from "react-icons/fa"; // Import the eye icon
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Eye, PawPrint, Printer } from "lucide-react";
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
  const [historyEvents, setHistoryEvents] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("Accepted");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const appwriteConfig = {
    endpoint: "https://cloud.appwrite.io/v1",
    projectId: "67094c000023e950be96",
    databaseId: "670a040f000893eb8e06",
    petCollectionId: "670ab2db00351bc09a92",
    userCollectionId: "670a04240019b97fcf05",
  };

  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

  const databases = new Databases(client);
  const account = new Account(client);

  //print ito
  const printRef = useRef();
  const handlePrint = () => {
    if (!printRef.current) return;

    const printContent = printRef.current;

    const windowPrint = window.open(
      "",
      "",
      "width=800,height=1200,left=0,top=0,toolbar=0,scrollbars=0,status=0"
    );

    if (!windowPrint) return;

    const styles = `
      <style>
        @page {
          size: 8.5in 11in; /* Full letter-size page */
          margin: 0; /* Remove all margins for edge-to-edge printing */
        }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          margin: 0; /* No margins on the body */
          padding: 0; /* No padding on the body */
          line-height: 1.4;
          color: #333;
          width: 100%; /* Fill the page horizontally */
          height: 100%; /* Fill the page vertically */
        }
        .container {
          width: 100%; /* Full width */
          height: 100%; /* Full height */
          padding: 40px; /* Add internal padding for content spacing */
          box-sizing: border-box; /* Include padding in total width/height */
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #fff; /* Ensure a white background */
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h1 {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }
        .header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 8px 0;
        }
        .header p {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        .section {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 12px;
          background: #f9f9f9;
        }
        .section h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .avatar {
          text-align: center;
          margin-bottom: 8px;
        }
        .avatar img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
        }
        .details {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 12px;
          background: #f9f9f9;
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 40px;
          margin-bottom: 20px;
        }
        .details p {
          font-size: 14px;
          margin: 4px 0;
        }
        .signature-section {
          display: flex;
          justify-content: space-between;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        .signature {
          text-align: center;
          width: 45%;
        }
        .signature .line {
          border-top: 1px solid #000;
          margin: 10px 0;
        }
        .terms {
          text-align: center;
          font-size: 12px;
          margin-top: 12px;
          color: #666;
        }
      </style>
    `;

    windowPrint.document.write(`
      <html>
        <head>
          <title>Pet-Care Appointment</title>
          ${styles}
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <h1>Pet-Care</h1>
              <h2>Appointment Form</h2>
              <p>Reference #: ${selectedAppointment?.$id}</p>
            </div>
  
            <!-- Owner and Pet Information -->
            <div class="grid">
              <!-- Owner Information -->
              <div class="section">
                <h3>Owner Information</h3>
                <div class="avatar">
                  <img src="${
                    selectedAppointment?.avatar || "/placeholder.svg"
                  }" alt="Owner">
                </div>
                <p><strong>${selectedAppointment?.name || "N/A"}</strong></p>
                <p>${selectedAppointment?.email || "N/A"}</p>
                <p>${selectedAppointment?.phone || "N/A"}</p>
              </div>
  
              <!-- Pet Information -->
              <div class="section">
                <h3>Pet Information</h3>
                <div class="avatar">
                  <img src="${
                    selectedAppointment?.petPhotoId || "/placeholder.svg"
                  }" alt="Pet">
                </div>
                <p><strong>${selectedAppointment?.petName || "N/A"}</strong></p>
                <p>Age: ${selectedAppointment?.petAge || "N/A"}</p>
                <p>Species: ${selectedAppointment?.petSpecies || "N/A"}</p>
              </div>
            </div>
  
            <!-- Date, Time, Clinic, and Room -->
            <div class="details">
              <p><strong>Date:</strong> ${formatDate(
                selectedAppointment?.petDate
              )}</p>
              <p><strong>Time:</strong> ${formatTime(
                selectedAppointment?.petTime
              )}</p>
              <p><strong>Clinic:</strong> ${
                selectedAppointment?.petClinic || "N/A"
              }</p>
              <p><strong>Room:</strong> ${
                selectedAppointment?.petRoom || "N/A"
              }</p>
            </div>
  
            <!-- Services, Payment, and Status -->
            <div class="details">
              <p><strong>Services:</strong> ${
                Array.isArray(selectedAppointment?.petServices)
                  ? selectedAppointment.petServices.join(", ")
                  : selectedAppointment?.petServices || "N/A"
              }</p>
              <p><strong>Payment:</strong> ${
                selectedAppointment?.petPayment || "N/A"
              } ₱</p>
              <p><strong>Status:</strong> ${
                selectedAppointment?.status || "N/A"
              }</p>
            </div>
  
            <!-- Signature Section -->
            <div class="signature-section">
              <div class="signature">
                <div class="line"></div>
                <p>Owner's Signature</p>
                <p>Date: ${new Date().toLocaleDateString()}</p>
              </div>
              <div class="signature">
                <div class="line"></div>
                <p>Veterinarian's Signature</p>
                <p>License No.: ________________</p>
              </div>
            </div>
  
            <!-- Terms -->
            <p class="terms">
              By signing, I confirm that all the information provided is accurate and I agree to Pet-Care's terms of service.
            </p>
          </div>
        </body>
      </html>
    `);

    windowPrint.document.close();
    windowPrint.focus();
    windowPrint.print();
    windowPrint.onafterprint = () => {
      windowPrint.close();
    };
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userId) return; // Exit if userId is not available

      try {
        // Fetch only "Pending" appointments for the current user
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.petCollectionId,
          [
            Query.equal("ownerId", userId), // Filter by ownerId
            Query.equal("status", "Pending"), // Filter by status
          ]
        );

        // Process appointments and fetch owner information
        const appointmentsWithOwnerInfo = await Promise.all(
          response.documents.map(async (appointment) => {
            try {
              // Fetch user details based on accountId from userCollectionId
              const ownerInfoResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                [Query.equal("accountId", appointment.ownerId)] // Match accountId with ownerId
              );

              const owner = ownerInfoResponse.documents[0]; // Assuming only one matching document

              return {
                ...appointment,
                name: owner?.name || "Unknown Name",
                email: owner?.email || "Unknown Email",
                phone: owner?.phone || "Unknown Phone",
                avatar: owner?.avatar || "/placeholder.svg",
              };
            } catch (error) {
              console.error(
                `Error fetching owner info for appointment ${appointment.$id} (ownerId: ${appointment.ownerId}): ${error.message}`
              );

              // Provide fallback information if the owner cannot be fetched
              return {
                ...appointment,
                name: "Unknown Owner",
                email: "Unknown Email",
                phone: "Unknown Phone",
                avatar: "/placeholder.svg",
              };
            }
          })
        );

        // Set appointments in state
        setAppointments(appointmentsWithOwnerInfo || []);
      } catch (error) {
        console.error("Error fetching appointments:", error.message);
        toast.error(
          "Failed to fetch appointments. Please check the database collections."
        );
      }
    };
    fetchAppointments();
  }, [userId]);

  useEffect(() => {
    if (showHistory) {
      const fetchHistory = async () => {
        if (!userId) return;
        try {
          const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.petCollectionId,
            [
              Query.equal("ownerId", userId),
              Query.equal("status", historyFilter),
            ]
          );

          // Process appointments and fetch owner information
          const historyWithOwnerInfo = await Promise.all(
            response.documents.map(async (appointment) => {
              try {
                // Fetch user details based on accountId from userCollectionId
                const ownerInfoResponse = await databases.listDocuments(
                  appwriteConfig.databaseId,
                  appwriteConfig.userCollectionId,
                  [Query.equal("accountId", appointment.ownerId)] // Match accountId with ownerId
                );

                const owner = ownerInfoResponse.documents[0]; // Assuming only one matching document

                return {
                  ...appointment,
                  name: owner?.name || "Unknown Name",
                  email: owner?.email || "Unknown Email",
                  phone: owner?.phone || "Unknown Phone",
                  avatar: owner?.avatar || "/placeholder.svg",
                };
              } catch (error) {
                console.error(
                  `Error fetching owner info for appointment ${appointment.$id} (ownerId: ${appointment.ownerId}): ${error.message}`
                );

                // Provide fallback information if the owner cannot be fetched
                return {
                  ...appointment,
                  name: "Unknown Owner",
                  email: "Unknown Email",
                  phone: "Unknown Phone",
                  avatar: "/placeholder.svg",
                };
              }
            })
          );

          setHistoryEvents(historyWithOwnerInfo || []);
        } catch (error) {
          console.error("Error fetching history:", error.message);
          toast.error("Failed to fetch history.");
        }
      };

      fetchHistory();
    }
  }, [showHistory, historyFilter]);

  // get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);
      } catch (error) {
        console.error("Error fetching user:", error.message);
        toast.error("Failed to fetch user information.");
      }
    };
    getCurrentUser();
  }, []);

  // date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  // time
  const formatTime = (time) => {
    if (!time) return "N/A";

    try {
      // Create a new Date object from the provided time
      const dateTime = new Date(time);

      // Adjust to local time explicitly using toLocaleTimeString
      return dateTime.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: "Asia/Manila", // Explicitly specify the timezone
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid time";
    }
  };

  const handlePreviewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
  };
  const renderTable = (data, isHistory = false) => (
    <div className="overflow-x-auto shadow-lg shadow-blue-500/20 rounded-lg">
      <table className="w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
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
            {!isHistory && (
              <>
                <th className="px-4 py-2 border border-gray-600 text-left text-gray-300">
                  Room
                </th>
                <th className="px-4 py-2 border border-gray-600 text-left text-gray-300">
                  Payment
                </th>
              </>
            )}
            <th className="px-4 py-2 border border-gray-600 text-left text-gray-300">
              Status
            </th>
            {historyFilter === "Accepted" && (
              <th className="px-4 py-2 border border-gray-600 text-left text-gray-300">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((appointment) => (
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
                  {new Date(appointment.petDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border border-gray-600 text-gray-300">
                  {formatTime(appointment.petTime)}
                </td>
                <td className="px-4 py-2 border border-gray-600 text-gray-300">
                  {appointment.petClinic || "N/A"}
                </td>
                {!isHistory && (
                  <>
                    <td className="px-4 py-2 border border-gray-600 text-gray-300">
                      {appointment.petRoom || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-600 text-gray-300">
                      {appointment.petPayment || "N/A"} ₱
                    </td>
                  </>
                )}
                <td className="px-4 py-2 border border-gray-600 text-gray-300">
                  {appointment.status}
                </td>
                {historyFilter === "Accepted" && (
                  <td className="px-4 py-2 border border-gray-600 text-gray-300">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => handlePreviewAppointment(appointment)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[800px] max-h-[90vh] bg-white text-gray-900 overflow-y-auto">
                        <div ref={printRef} className="bg-white p-4 space-y-4">
                          {/* Header */}
                          <div className="text-center">
                            <div className="flex justify-center items-center mb-2">
                              <PawPrint className="w-6 h-6 text-primary mr-2" />
                              <h1 className="text-xl font-bold text-primary">
                                Pet-Care
                              </h1>
                            </div>
                            <h2 className="text-lg font-semibold">
                              Appointment Form
                            </h2>
                          </div>

                          {/* Owner and Pet Information */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Owner Information */}
                            <div className="border p-4 rounded">
                              <h3 className="text-sm font-semibold text-primary mb-2">
                                Owner Information
                              </h3>
                              <div className="flex gap-2">
                                <img
                                  src={
                                    selectedAppointment?.avatar ||
                                    "/placeholder.svg"
                                  }
                                  alt="Owner"
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                                <div className="text-sm">
                                  <p className="font-semibold">
                                    {selectedAppointment?.name || "N/A"}
                                  </p>
                                  <p>{selectedAppointment?.email || "N/A"}</p>
                                  <p>{selectedAppointment?.phone || "N/A"}</p>
                                </div>
                              </div>
                            </div>

                            {/* Pet Information */}
                            <div className="border p-4 rounded">
                              <h3 className="text-sm font-semibold text-primary mb-2">
                                Pet Information
                              </h3>
                              <div className="flex gap-2">
                                <img
                                  src={
                                    selectedAppointment?.petPhotoId ||
                                    "/placeholder.svg"
                                  }
                                  alt="Pet"
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                                <div className="text-sm">
                                  <p className="font-semibold">
                                    {selectedAppointment?.petName || "N/A"}
                                  </p>
                                  <p>
                                    Age: {selectedAppointment?.petAge || "N/A"}
                                  </p>
                                  <p>
                                    Species:{" "}
                                    {selectedAppointment?.petSpecies || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Appointment Details */}
                          <div className="grid grid-cols-2 gap-4 border p-4 rounded">
                            <div>
                              <p className="text-sm font-semibold">Date</p>
                              <p>{formatDate(selectedAppointment?.petDate)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold">Time</p>
                              <p>{formatTime(selectedAppointment?.petTime)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold">Clinic</p>
                              <p>{selectedAppointment?.petClinic || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold">Room</p>
                              <p>{selectedAppointment?.petRoom || "N/A"}</p>
                            </div>
                          </div>

                          {/* Services and Payment */}
                          <div className="grid grid-cols-2 gap-4 border p-4 rounded">
                            <div>
                              <p className="text-sm font-semibold">Services</p>
                              <p>
                                {Array.isArray(selectedAppointment?.petServices)
                                  ? selectedAppointment.petServices.join(", ")
                                  : selectedAppointment?.petServices || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold">Payment</p>
                              <p>
                                {selectedAppointment?.petPayment || "N/A"} ₱
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold">Status</p>
                              <p>{selectedAppointment?.status || "N/A"}</p>
                            </div>
                          </div>

                          {/* Signature Section */}
                          <div className="mt-6 pt-6 border-t">
                            <div className="grid grid-cols-2 gap-8">
                              <div>
                                <p className="font-semibold text-gray-700 mb-2">
                                  Owner's Signature:
                                </p>
                                <div className="h-16 border-b border-gray-300"></div>
                                <p className="text-sm text-gray-500 text-center mt-2">
                                  Date: {new Date().toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-700 mb-2">
                                  Veterinarian's Signature:
                                </p>
                                <div className="h-16 border-b border-gray-300"></div>
                                <p className="text-sm text-gray-500 text-center mt-2">
                                  License No.: ________________
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Terms */}
                          <div className="text-center mt-4">
                            <p className="text-xs text-gray-500">
                              By signing, I confirm that all the information
                              provided is accurate and I agree to Pet-Care's
                              terms of service.
                            </p>
                          </div>
                        </div>

                        {/* Print Button */}
                        <div className="flex justify-end mt-4">
                          <Button
                            onClick={handlePrint}
                            className="bg-primary hover:bg-primary/90 text-white"
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={isHistory ? "6" : "8"}
                className="px-4 py-2 border border-gray-600 text-center text-gray-300"
              >
                No {isHistory ? historyFilter.toLowerCase() : "pending"}{" "}
                appointments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-gray-100 min-h-screen">
      <Button
        className="absolute top-4 right-4 bg-pink-500 text-white hover:bg-pink-400"
        onClick={() => setShowHistory(!showHistory)}
      >
        {showHistory ? "Back to Appointments" : "History"}
      </Button>

      <Card
        className={`bg-gray-800 border-gray-700 rounded-lg ${
          showHistory ? "shadow-red-500/20" : "shadow-blue-500/20"
        } shadow-lg`}
      >
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-100">
            {showHistory ? "Appointments History" : "Your Pet's Appointments"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showHistory ? (
            <>
              <div className="mb-4">
                <select
                  className="px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded"
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                >
                  <option value="Accepted">Accepted</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>
              {renderTable(historyEvents, true)}
            </>
          ) : (
            renderTable(appointments)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
