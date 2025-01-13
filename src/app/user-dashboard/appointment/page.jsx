"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Client, Databases, Account, Query } from "appwrite";
import { toast } from "react-toastify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Eye, PawPrint, Printer, Check, Star } from "lucide-react";
import { RatingModal } from "./RatingModal";

export default function Appointment() {
  const [appointments, setAppointments] = useState([]);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("Accepted");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingAppointment, setRatingAppointment] = useState(null);

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
          size: 8.5in 11in;
          margin: 0;
        }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          margin: 0;
          padding: 0;
          line-height: 1.4;
          color: #333;
          width: 100%;
          height: 100%;
        }
        .container {
          width: 100%;
          height: 100%;
          padding: 40px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #fff;
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
            <div class="header">
              <h1>Pet-Care</h1>
              <h2>Appointment Form</h2>
              <p>Reference #: ${selectedAppointment?.$id}</p>
            </div>
  
            <div class="grid">
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
      if (!userId) return;

      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.petCollectionId,
          [Query.equal("ownerId", userId), Query.equal("status", "Pending")]
        );

        const appointmentsWithOwnerInfo = await Promise.all(
          response.documents.map(async (appointment) => {
            try {
              const ownerInfoResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                [Query.equal("accountId", appointment.ownerId)]
              );

              const owner = ownerInfoResponse.documents[0];

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

          const historyWithOwnerInfo = await Promise.all(
            response.documents.map(async (appointment) => {
              try {
                const ownerInfoResponse = await databases.listDocuments(
                  appwriteConfig.databaseId,
                  appwriteConfig.userCollectionId,
                  [Query.equal("accountId", appointment.ownerId)]
                );

                const owner = ownerInfoResponse.documents[0];

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
      const localTime = new Date(
        dateTime.getTime() + dateTime.getTimezoneOffset() * 60000
      );

      return localTime.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid time";
    }
  };

  const handlePreviewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleOpenRatingModal = (appointment) => {
    setRatingAppointment(appointment);
    localStorage.setItem(
      "appointmentForFeedback",
      JSON.stringify({
        appointmentId: appointment.$id,
        petName: appointment.petName,
        service: appointment.petServices,
        clinic: appointment.petClinic,
      })
    );
    setIsRatingModalOpen(true);
  };

  const handleFeedbackSubmitted = async () => {
    // Refresh the history events to show updated status
    if (userId) {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.petCollectionId,
          [Query.equal("ownerId", userId), Query.equal("status", historyFilter)]
        );

        const updatedHistory = await Promise.all(
          response.documents.map(async (appointment) => {
            try {
              const ownerInfoResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                [Query.equal("accountId", appointment.ownerId)]
              );

              const owner = ownerInfoResponse.documents[0];

              return {
                ...appointment,
                name: owner?.name || "Unknown Name",
                email: owner?.email || "Unknown Email",
                phone: owner?.phone || "Unknown Phone",
                avatar: owner?.avatar || "/placeholder.svg",
              };
            } catch (error) {
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

        setHistoryEvents(updatedHistory || []);
      } catch (error) {
        console.error("Error refreshing history:", error);
      }
    }
  };

  const handleSubmitRating = async (rating) => {
    try {
      if (!ratingAppointment) {
        toast.error("No appointment selected for rating");
        return;
      }

      // Store appointment data in localStorage for the feedback form
      localStorage.setItem(
        "appointmentForFeedback",
        JSON.stringify({
          appointmentId: ratingAppointment.$id,
          petName: ratingAppointment.petName,
          service: ratingAppointment.petServices,
          clinic: ratingAppointment.petClinic,
        })
      );

      // Update the appointment to mark it as rated
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId,
        ratingAppointment.$id,
        { hasRated: true }
      );

      // Update only the specific appointment in the local state
      setHistoryEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.$id === ratingAppointment.$id
            ? { ...event, hasRated: true }
            : event
        )
      );

      setIsRatingModalOpen(false);
      toast.success("Rating submitted successfully!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating. Please try again.");
    }
  };

  const renderTable = (data, isHistory = false) => (
    <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full align-middle">
        {/* Mobile View */}
        <div className="md:hidden">
          {data.length > 0 ? (
            data.map((appointment) => (
              <div
                key={appointment.$id}
                className="bg-white p-4 mb-4 rounded-lg shadow border border-gray-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {appointment.petName || "N/A"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {appointment.petClinic || "N/A"}
                    </p>
                  </div>
                  <Badge
                    className={`${
                      appointment.status === "Accepted" ||
                      appointment.status?.[0] === "Accepted"
                        ? "bg-green-500 text-white hover:bg-green-600 border-green-600"
                        : appointment.status === "Pending" ||
                          appointment.status?.[0] === "Pending"
                        ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-600"
                        : appointment.status === "Declined" ||
                          appointment.status?.[0] === "Declined"
                        ? "bg-red-900 text-white hover:bg-red-600 border-red-600"
                        : appointment.status === "Done" ||
                          appointment.status?.[0] === "Done"
                        ? "bg-green-500 text-white hover:bg-green-600 border-green-600"
                        : "bg-gray-500 text-white hover:bg-gray-600 border-gray-600"
                    } text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 w-fit`}
                  >
                    {appointment.status}
                    {(appointment.status === "Done" ||
                      appointment.status?.[0] === "Done") && (
                      <Check className="w-3 h-3" />
                    )}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">
                      {Array.isArray(appointment.petServices)
                        ? appointment.petServices[0]
                        : appointment.petServices || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(appointment.petDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">
                      {formatTime(appointment.petTime)}
                    </span>
                  </div>
                  {!isHistory && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room:</span>
                        <span className="font-medium">
                          {appointment.petRoom || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment:</span>
                        <span className="font-medium">
                          {appointment.petPayment || "N/A"} ₱
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {isHistory &&
                  (historyFilter === "Accepted" ||
                    historyFilter === "Done") && (
                    <div className="mt-4 flex gap-2">
                      {historyFilter === "Accepted" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() =>
                                handlePreviewAppointment(appointment)
                              }
                              size="sm"
                              className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[800px] w-[95%] max-h-[90vh] bg-white text-gray-800 overflow-y-auto border border-gray-200 p-4 md:p-6">
                            <div ref={printRef} className="bg-white space-y-4">
                              {/* Header */}
                              <div className="text-center">
                                <div className="flex justify-center items-center mb-2">
                                  <PawPrint className="w-6 h-6 text-blue-600 mr-2" />
                                  <h1 className="text-xl font-bold text-blue-600">
                                    Pet-Care
                                  </h1>
                                </div>
                                <h2 className="text-lg font-semibold">
                                  Appointment Form
                                </h2>
                                <p className="text-sm text-gray-500">
                                  Reference #: {selectedAppointment?.$id}
                                </p>
                              </div>

                              {/* Owner and Pet Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Owner Information */}
                                <div className="border p-4 rounded">
                                  <h3 className="text-sm font-semibold text-blue-600 mb-2">
                                    Owner Information
                                  </h3>
                                  <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                                    <img
                                      src={
                                        selectedAppointment?.avatar ||
                                        "/placeholder.svg"
                                      }
                                      alt="Owner"
                                      className="w-20 h-20 rounded-full object-cover"
                                    />
                                    <div className="text-sm text-center sm:text-left">
                                      <p className="font-semibold">
                                        {selectedAppointment?.name || "N/A"}
                                      </p>
                                      <p>
                                        {selectedAppointment?.email || "N/A"}
                                      </p>
                                      <p>
                                        {selectedAppointment?.phone || "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Pet Information */}
                                <div className="border p-4 rounded">
                                  <h3 className="text-sm font-semibold text-blue-600 mb-2">
                                    Pet Information
                                  </h3>
                                  <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                                    <img
                                      src={
                                        selectedAppointment?.petPhotoId ||
                                        "/placeholder.svg"
                                      }
                                      alt="Pet"
                                      className="w-20 h-20 rounded-full object-cover"
                                    />
                                    <div className="text-sm text-center sm:text-left">
                                      <p className="font-semibold">
                                        {selectedAppointment?.petName || "N/A"}
                                      </p>
                                      <p>
                                        Age:{" "}
                                        {selectedAppointment?.petAge || "N/A"}
                                      </p>
                                      <p>
                                        Species:{" "}
                                        {selectedAppointment?.petSpecies ||
                                          "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Appointment Details */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded">
                                <div>
                                  <p className="text-sm font-semibold">Date</p>
                                  <p>
                                    {formatDate(selectedAppointment?.petDate)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">Time</p>
                                  <p>
                                    {formatTime(selectedAppointment?.petTime)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">
                                    Clinic
                                  </p>
                                  <p>
                                    {selectedAppointment?.petClinic || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">Room</p>
                                  <p>{selectedAppointment?.petRoom || "N/A"}</p>
                                </div>
                              </div>

                              {/* Services and Payment */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded">
                                <div>
                                  <p className="text-sm font-semibold">
                                    Services
                                  </p>
                                  <p>
                                    {Array.isArray(
                                      selectedAppointment?.petServices
                                    )
                                      ? selectedAppointment.petServices.join(
                                          ", "
                                        )
                                      : selectedAppointment?.petServices ||
                                        "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">
                                    Payment
                                  </p>
                                  <p>
                                    {selectedAppointment?.petPayment || "N/A"} ₱
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">
                                    Status
                                  </p>
                                  <p>{selectedAppointment?.status || "N/A"}</p>
                                </div>
                              </div>

                              {/* Signature Section */}
                              <div className="mt-6 pt-6 border-t">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="text-center">
                                    <p className="font-semibold text-gray-700 mb-2">
                                      Owner's Signature:
                                    </p>
                                    <div className="h-16 border-b border-gray-300"></div>
                                    <p className="text-sm text-gray-500 mt-2">
                                      Date: {new Date().toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-semibold text-gray-700 mb-2">
                                      Veterinarian's Signature:
                                    </p>
                                    <div className="h-16 border-b border-gray-300"></div>
                                    <p className="text-sm text-gray-500 mt-2">
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
                                className="bg-blue-100 hover:bg-blue-200 text-blue-700"
                              >
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {historyFilter === "Done" && (
                        <Button
                          onClick={() => handleOpenRatingModal(appointment)}
                          size="sm"
                          className={`${
                            appointment.hasRated
                              ? "bg-green-100 text-green-700 cursor-not-allowed opacity-80"
                              : "bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                          } font-medium rounded-full`}
                          disabled={appointment.hasRated}
                        >
                          {appointment.hasRated ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Rated
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4 mr-2" />
                              Rate
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-600">
              No {isHistory ? historyFilter.toLowerCase() : "pending"}{" "}
              appointments found.
            </div>
          )}
        </div>

        {/* Desktop View - Keep existing table structure */}
        <table className="min-w-full divide-y divide-gray-200 hidden md:table">
          <thead>
            <tr className="bg-blue-50">
              <th
                scope="col"
                className="pl-6 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"
              >
                Pet Name
              </th>
              <th
                scope="col"
                className="pl-6 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"
              >
                Service
              </th>
              <th
                scope="col"
                className="pl-6 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"
              >
                Date
              </th>
              <th
                scope="col"
                className="pl-6 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"
              >
                Time
              </th>
              <th
                scope="col"
                className="pl-6 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"
              >
                Clinic
              </th>
              {!isHistory && (
                <>
                  <th
                    scope="col"
                    className="pl-6 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"
                  >
                    Room
                  </th>
                  <th
                    scope="col"
                    className="pl-6 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"
                  >
                    Payment
                  </th>
                </>
              )}
              <th
                scope="col"
                className="pl-6 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"
              >
                Status
              </th>
              {isHistory &&
                (historyFilter === "Accepted" || historyFilter === "Done") && (
                  <th
                    scope="col"
                    className="pl-6 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"
                  >
                    Actions
                  </th>
                )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((appointment) => (
                <tr
                  key={appointment.$id}
                  className="hover:bg-blue-50 transition-colors duration-150"
                >
                  <td className="pl-10 px-4 py-3 whitespace-nowrap text-base text-gray-600 font-medium ">
                    {appointment.petName || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-base text-gray-600">
                    {Array.isArray(appointment.petServices)
                      ? appointment.petServices[0] || "N/A"
                      : appointment.petServices || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-base text-gray-600 hidden sm:table-cell">
                    {new Date(appointment.petDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-base text-gray-600 hidden sm:table-cell">
                    {formatTime(appointment.petTime)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-base text-gray-600">
                    {appointment.petClinic || "N/A"}
                  </td>
                  {!isHistory && (
                    <>
                      <td className="px-4 py-3 whitespace-nowrap text-base text-gray-600 hidden md:table-cell">
                        {appointment.petRoom || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-base text-gray-600">
                        {appointment.petPayment || "N/A"} ₱
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap text-base text-gray-600">
                    <Badge
                      className={`${
                        appointment.status === "Accepted" ||
                        appointment.status?.[0] === "Accepted"
                          ? "bg-green-500 text-white hover:bg-green-600 border-green-600"
                          : appointment.status === "Pending" ||
                            appointment.status?.[0] === "Pending"
                          ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-600"
                          : appointment.status === "Declined" ||
                            appointment.status?.[0] === "Declined"
                          ? "bg-red-900 text-white hover:bg-red-600 border-red-600"
                          : appointment.status === "Done" ||
                            appointment.status?.[0] === "Done"
                          ? "bg-green-500 text-white hover:bg-green-600 border-green-600"
                          : "bg-gray-500 text-white hover:bg-gray-600 border-gray-600"
                      } text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 w-fit`}
                    >
                      {appointment.status}
                      {(appointment.status === "Done" ||
                        appointment.status?.[0] === "Done") && (
                        <Check className="w-3 h-3" />
                      )}
                    </Badge>
                  </td>
                  {isHistory &&
                    (historyFilter === "Accepted" ||
                      historyFilter === "Done") && (
                      <td className="px-4 py-3 whitespace-nowrap text-base text-gray-600">
                        {historyFilter === "Accepted" && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() =>
                                  handlePreviewAppointment(appointment)
                                }
                                size="sm"
                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-full mr-2"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[800px] w-[95%] max-h-[90vh] bg-white text-gray-800 overflow-y-auto border border-gray-200 p-4 md:p-6">
                              <div
                                ref={printRef}
                                className="bg-white space-y-4"
                              >
                                {/* Header */}
                                <div className="text-center">
                                  <div className="flex justify-center items-center mb-2">
                                    <PawPrint className="w-6 h-6 text-blue-600 mr-2" />
                                    <h1 className="text-xl font-bold text-blue-600">
                                      Pet-Care
                                    </h1>
                                  </div>
                                  <h2 className="text-lg font-semibold">
                                    Appointment Form
                                  </h2>
                                  <p className="text-sm text-gray-500">
                                    Reference #: {selectedAppointment?.$id}
                                  </p>
                                </div>

                                {/* Owner and Pet Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Owner Information */}
                                  <div className="border p-4 rounded">
                                    <h3 className="text-sm font-semibold text-blue-600 mb-2">
                                      Owner Information
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                                      <img
                                        src={
                                          selectedAppointment?.avatar ||
                                          "/placeholder.svg"
                                        }
                                        alt="Owner"
                                        className="w-20 h-20 rounded-full object-cover"
                                      />
                                      <div className="text-sm text-center sm:text-left">
                                        <p className="font-semibold">
                                          {selectedAppointment?.name || "N/A"}
                                        </p>
                                        <p>
                                          {selectedAppointment?.email || "N/A"}
                                        </p>
                                        <p>
                                          {selectedAppointment?.phone || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Pet Information */}
                                  <div className="border p-4 rounded">
                                    <h3 className="text-sm font-semibold text-blue-600 mb-2">
                                      Pet Information
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                                      <img
                                        src={
                                          selectedAppointment?.petPhotoId ||
                                          "/placeholder.svg"
                                        }
                                        alt="Pet"
                                        className="w-20 h-20 rounded-full object-cover"
                                      />
                                      <div className="text-sm text-center sm:text-left">
                                        <p className="font-semibold">
                                          {selectedAppointment?.petName ||
                                            "N/A"}
                                        </p>
                                        <p>
                                          Age:{" "}
                                          {selectedAppointment?.petAge || "N/A"}
                                        </p>
                                        <p>
                                          Species:{" "}
                                          {selectedAppointment?.petSpecies ||
                                            "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Appointment Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded">
                                  <div>
                                    <p className="text-sm font-semibold">
                                      Date
                                    </p>
                                    <p>
                                      {formatDate(selectedAppointment?.petDate)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">
                                      Time
                                    </p>
                                    <p>
                                      {formatTime(selectedAppointment?.petTime)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">
                                      Clinic
                                    </p>
                                    <p>
                                      {selectedAppointment?.petClinic || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">
                                      Room
                                    </p>
                                    <p>
                                      {selectedAppointment?.petRoom || "N/A"}
                                    </p>
                                  </div>
                                </div>

                                {/* Services and Payment */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded">
                                  <div>
                                    <p className="text-sm font-semibold">
                                      Services
                                    </p>
                                    <p>
                                      {Array.isArray(
                                        selectedAppointment?.petServices
                                      )
                                        ? selectedAppointment.petServices.join(
                                            ", "
                                          )
                                        : selectedAppointment?.petServices ||
                                          "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">
                                      Payment
                                    </p>
                                    <p>
                                      {selectedAppointment?.petPayment || "N/A"}{" "}
                                      ₱
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">
                                      Status
                                    </p>
                                    <p>
                                      {selectedAppointment?.status || "N/A"}
                                    </p>
                                  </div>
                                </div>

                                {/* Signature Section */}
                                <div className="mt-6 pt-6 border-t">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="text-center">
                                      <p className="font-semibold text-gray-700 mb-2">
                                        Owner's Signature:
                                      </p>
                                      <div className="h-16 border-b border-gray-300"></div>
                                      <p className="text-sm text-gray-500 mt-2">
                                        Date: {new Date().toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="font-semibold text-gray-700 mb-2">
                                        Veterinarian's Signature:
                                      </p>
                                      <div className="h-16 border-b border-gray-300"></div>
                                      <p className="text-sm text-gray-500 mt-2">
                                        License No.: ________________
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Terms */}
                                <div className="text-center mt-4">
                                  <p className="text-xs text-gray-500">
                                    By signing, I confirm that all the
                                    information provided is accurate and I agree
                                    to Pet-Care's terms of service.
                                  </p>
                                </div>
                              </div>

                              {/* Print Button */}
                              <div className="flex justify-end mt-4">
                                <Button
                                  onClick={handlePrint}
                                  className="bg-blue-100 hover:bg-blue-200 text-blue-700"
                                >
                                  <Printer className="w-4 h-4 mr-2" />
                                  Print
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        {historyFilter === "Done" && (
                          <Button
                            onClick={() => handleOpenRatingModal(appointment)}
                            size="sm"
                            className={`${
                              appointment.hasRated
                                ? "bg-green-100 text-green-700 cursor-not-allowed opacity-80"
                                : "bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                            } font-medium rounded-full`}
                            disabled={appointment.hasRated}
                          >
                            {appointment.hasRated ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Rated
                              </>
                            ) : (
                              <>
                                <Star className="w-4 h-4 mr-2" />
                                Rate
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    isHistory
                      ? historyFilter === "Accepted" || historyFilter === "Done"
                        ? 7
                        : 6
                      : 7
                  }
                  className="px-4 py-3 whitespace-nowrap text-base text-center text-gray-600"
                >
                  No {isHistory ? historyFilter.toLowerCase() : "pending"}{" "}
                  appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-blue-50 text-gray-800 min-h-screen">
      <Card className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {showHistory ? "Appointments History" : "Your Pet's Appointments"}
          </CardTitle>
          <Button
            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Back to Appointments" : "History"}
          </Button>
        </CardHeader>
        <CardContent>
          {showHistory ? (
            <>
              <div className="mb-4 sm:flex sm:justify-end">
                <select
                  className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded"
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                >
                  <option value="Accepted">Accepted</option>
                  <option value="Declined">Declined</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              {renderTable(historyEvents, true)}
            </>
          ) : (
            renderTable(appointments)
          )}
        </CardContent>
      </Card>
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleSubmitRating}
        onSubmitSuccess={handleFeedbackSubmitted}
        petPhotoId={ratingAppointment?.petPhotoId}
      />
    </div>
  );
}
