import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveAppointmentToDatabase, getCurrentUserId } from "@/lib/appwrite";
import { Client, Databases } from "appwrite";

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

export default function NewAppointmentModal({ isOpen, onClose, pet }) {
  const [services, setServices] = useState(["Pet Training"]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [clinic, setClinic] = useState("");
  const [room, setRoom] = useState("");
  const [payment, setPayment] = useState("1000");
  const [petDetails, setPetDetails] = useState({
    petName: "N/A",
    petType: "N/A",
    petSpecies: "N/A",
    petAge: "N/A",
  });
  // Helper function to validate document IDs
  const isValidDocumentId = (id) => {
    const regex = /^[a-zA-Z0-9_]{1,36}$/;
    return regex.test(id);
  };

  useEffect(() => {
    const fetchPetDetails = async () => {
      if (pet && isValidDocumentId(pet)) {
        try {
          const petData = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.petCollectionId,
            pet
          );
          setPetDetails({
            petName: petData.petName || "N/A",
            petType: petData.petType || "N/A",
            petSpecies: petData.petSpecies || "N/A",
            petAge: petData.petAge || "N/A",
          });
        } catch (error) {
          console.error("Error fetching pet details:", error);
        }
      } else {
        console.warn("Invalid pet document ID format:", pet);
      }
    };

    if (isOpen) fetchPetDetails();
  }, [isOpen, pet]);

  const handleServiceChange = (selectedService) => {
    setServices([selectedService]); // Always set services as an array with one or more items
    setPayment(
      {
        "Pet Grooming": "500",
        "Veterinary Care": "1500",
        "Pet Training": "1000",
        "Pet Boarding": "1000 ",
      }[selectedService] || "0"
    );
  };

  const handleSave = async () => {
    try {
      const ownerId = await getCurrentUserId();
      if (!ownerId) throw new Error("User ID not retrieved");

      // Ensure petPayment is within the valid range
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
        petName: pet?.name,
        petType: pet?.type,
        petSpecies: pet?.species,
        petAge: pet?.age,
        petPhotoId: pet?.photoId || "N/A",
        status: ["Pending"],
      };

      await saveAppointmentToDatabase(appointmentData);
      alert("Appointment saved successfully!");
      onClose();
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert("Failed to save appointment. Please try again.");
    }
  };

  if (!isOpen || !pet) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book New Appointment</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <p>Pet Name: {pet.name}</p>
            <p>Pet Type: {pet.type}</p>
            <p>Pet Species: {pet.species}</p>
            <p>Pet Age: {pet.age}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Service</label>
              <Select onValueChange={handleServiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pet Grooming">Pet Grooming</SelectItem>
                  <SelectItem value="Veterinary Care">
                    Veterinary Care
                  </SelectItem>
                  <SelectItem value="Pet Training">Pet Training</SelectItem>
                  <SelectItem value="Pet Boarding">Pet Boarding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label>Clinic</label>
              <Select onValueChange={(value) => setClinic(value)}>
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
              />
            </div>

            <div>
              <label>Room</label>
              <Select onValueChange={(value) => setRoom(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Room 1">Room 1</SelectItem>
                  <SelectItem value="Room 2">Room 2</SelectItem>
                  <SelectItem value="Room 3">Room 3</SelectItem>
                  <SelectItem value="Room 4">Room 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label>Time</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
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
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
