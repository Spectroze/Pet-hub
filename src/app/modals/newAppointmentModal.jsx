"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveAppointmentToDatabase, getCurrentUserId } from "@/lib/appwrite";
import { Client, Databases } from "appwrite";
import { toast } from "react-toastify";

// Appwrite configuration
const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "67094c000023e950be96",
  databaseId: "670a040f000893eb8e06",
  petCollectionId: "670ab2db00351bc09a92",
};

// Appwrite client and database setup
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);
const databases = new Databases(client);

const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
};

const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`; // Format: HH:MM
};

export default function NewAppointmentModal({ isOpen, onClose, pet }) {
  const [services, setServices] = useState([]);
  const [date, setDate] = useState(getCurrentDate());
  const [time, setTime] = useState(getCurrentTime());
  const [clinic, setClinic] = useState("");
  const [room, setRoom] = useState("");
  const [payment, setPayment] = useState("0");
  const [petDetails, setPetDetails] = useState({
    petName: "N/A",
    petType: "N/A",
    petSpecies: "N/A",
    petAge: "N/A",
    petPhotoId: null,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const servicesOptions = [
    "Pet Grooming",
    "Pet Veterinary",
    "Pet Training",
    "Pet Boarding",
  ];

  // Helper function to validate document IDs
  const isValidDocumentId = (id) => {
    const regex = /^[a-zA-Z0-9_]{1,36}$/;
    return regex.test(id);
  };

  const checkFormValidity = useCallback(() => {
    const isValid =
      services.length > 0 &&
      date.trim() !== "" &&
      time.trim() !== "" &&
      clinic.trim() !== "" &&
      room.trim() !== "" &&
      Number(payment) > 0;
    setIsFormValid(isValid);
  }, [services, date, time, clinic, room, payment]);

  useEffect(() => {
    checkFormValidity();
  }, [services, date, time, clinic, room, payment, checkFormValidity]);

  useEffect(() => {
    const fetchPetDetails = async () => {
      if (pet && typeof pet === "object") {
        console.log("Using provided pet details:", pet);
        setPetDetails({
          petName: pet.name || "N/A",
          petType: pet.type || "N/A",
          petSpecies: pet.species || "N/A",
          petAge: pet.age || "N/A",
          petPhotoId: pet.petPhoto || null,
        });
      } else if (pet && isValidDocumentId(pet)) {
        try {
          console.log("Fetching pet details for ID:", pet);
          const petData = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.petCollectionId,
            pet
          );
          console.log("Fetched pet data:", petData);

          setPetDetails({
            petName: petData.petName || "N/A",
            petType: petData.petType || "N/A",
            petSpecies: petData.petSpecies || "N/A",
            petAge: petData.petAge || "N/A",
            petPhotoId: petData.petPhotoId || null,
          });
        } catch (error) {
          console.error("Error fetching pet details:", error);
          setPetDetails({
            petName: "N/A",
            petType: "N/A",
            petSpecies: "N/A",
            petAge: "N/A",
            petPhotoId: null,
          });
        }
      } else {
        console.warn("Invalid pet ID or object provided:", pet);
        setPetDetails({
          petName: "N/A",
          petType: "N/A",
          petSpecies: "N/A",
          petAge: "N/A",
          petPhotoId: null,
        });
      }
    };

    if (isOpen) fetchPetDetails();
  }, [isOpen, pet]);

  const handleServiceChange = (selectedService, isChecked) => {
    let updatedServices;
    if (isChecked) {
      updatedServices = [...services, selectedService];
    } else {
      updatedServices = services.filter(
        (service) => service !== selectedService
      );
    }
    setServices(updatedServices);

    const totalPayment = updatedServices.reduce((sum, service) => {
      return (
        sum +
        ({
          "Pet Grooming": 500,
          "Pet Veterinary": 1500,
          "Pet Training": 1000,
          "Pet Boarding": 1000,
        }[service] || 0)
      );
    }, 0);
    setPayment(totalPayment.toString());
  };

  const handleSave = async () => {
    try {
      const ownerId = await getCurrentUserId();
      if (!ownerId) throw new Error("User ID not retrieved");

      const validatedPayment = Math.max(500, Math.min(1200, Number(payment)));

      const appointmentData = {
        petServices: services,
        petDate: [date],
        petTime: [time],
        petClinic: [clinic],
        petRoom: [room],
        petPayment: validatedPayment,
        ownerId,
        petId: pet?.id,
        petName: petDetails.petName,
        petType: petDetails.petType,
        petSpecies: petDetails.petSpecies,
        petAge: petDetails.petAge,
        petPhotoId: petDetails.petPhotoId,
        status: ["Pending"],
      };

      console.log("Saving appointment data:", appointmentData);

      await saveAppointmentToDatabase(appointmentData);
      toast.success("Appointment saved successfully!");
      onClose();
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error("Failed to save appointment. Please try again.");
    }
  };

  if (!isOpen || !pet) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-4 rounded-lg w-full max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Book New Appointment</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {petDetails.petPhotoId ? (
            <div className="mt-4">
              <label>Pet Photo</label>
              <img
                src={petDetails.petPhotoId}
                alt={`${petDetails.petName}'s photo`}
                className="w-32 h-32 object-cover rounded"
              />
            </div>
          ) : (
            <p className="text-gray-500">No photo available for this pet.</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <p>Pet Name: {petDetails.petName}</p>
            <p>Pet Type: {petDetails.petType}</p>
            <p>Pet Species: {petDetails.petSpecies}</p>
            <p>Pet Age: {petDetails.petAge}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Pet Services
              </label>
              <div
                className="border rounded-md p-2 bg-white cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {services.length > 0
                  ? services.join(", ")
                  : "Select pet services"}
              </div>

              {dropdownOpen && (
                <div className="absolute z-10 mt-2 bg-white shadow-md rounded-md w-full">
                  {servicesOptions.map((service) => (
                    <div
                      key={service}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                    >
                      <Checkbox
                        id={service}
                        checked={services.includes(service)}
                        onCheckedChange={(checked) =>
                          handleServiceChange(service, checked)
                        }
                      />
                      <label htmlFor={service} className="text-sm">
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label>Clinic</label>
              <Select
                onValueChange={(value) => {
                  setClinic(value);
                  setRoom("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a clinic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clinic 1">Clinic 1</SelectItem>
                  <SelectItem value="Clinic 2">Clinic 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label>Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={getCurrentDate()}
              />
            </div>

            <div>
              <label>Room</label>
              <Select
                onValueChange={(value) => setRoom(value)}
                disabled={!clinic}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {clinic === "Clinic 1" ? (
                    <>
                      <SelectItem value="Room 1">Room 1</SelectItem>
                      <SelectItem value="Room 2">Room 2</SelectItem>
                      <SelectItem value="Room 3">Room 3</SelectItem>
                      <SelectItem value="Room 4">Room 4</SelectItem>
                    </>
                  ) : clinic === "Clinic 2" ? (
                    <>
                      <SelectItem value="Room A">Room A</SelectItem>
                      <SelectItem value="Room B">Room B</SelectItem>
                      <SelectItem value="Room C">Room C</SelectItem>
                      <SelectItem value="Room D">Room D</SelectItem>
                    </>
                  ) : null}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label>Time</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => {
                  const selectedDateTime = new Date(
                    `${date}T${e.target.value}`
                  );
                  const currentDateTime = new Date();
                  if (selectedDateTime > currentDateTime) {
                    setTime(e.target.value);
                  } else {
                    toast.error("Please select a future time.");
                  }
                }}
                min={date === getCurrentDate() ? getCurrentTime() : undefined}
              />
            </div>

            <div>
              <label>Payment (₱)</label>
              <p className="text-lg font-semibold text-gray-700">₱{payment}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isFormValid}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
