import React, { useState } from "react";
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

export default function NewAppointmentModal({ isOpen, onClose }) {
  const [petName, setPetName] = useState("");
  const [services, setServices] = useState(["Pet Training"]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [species, setSpecies] = useState("");
  const [petType, setPetType] = useState("");
  const [age, setAge] = useState("");
  const [clinic, setClinic] = useState("");
  const [room, setRoom] = useState("");
  const [payment, setPayment] = useState("1000");

  const handleServiceChange = (selectedService) => {
    setServices([selectedService]);
    switch (selectedService) {
      case "Pet Grooming":
        setPayment("500");
        break;
      case "Veterinary Care":
        setPayment("1500");
        break;
      case "Pet Training":
        setPayment("1000");
        break;
      case "Pet Boarding":
        setPayment("100");
        break;
      default:
        setPayment("");
    }
  };

  const handleSave = async () => {
    try {
      const ownerId = await getCurrentUserId();
      if (!ownerId) throw new Error("User ID not retrieved");

      // Prepare the appointment data
      const appointmentData = {
        petName,
        services,
        date,
        time,
        species,
        petType,
        petAge: age,
        clinic,
        room,
        payment: Number(payment),
        ownerId,
      };

      // Filter out any empty fields
      const filteredAppointmentData = Object.fromEntries(
        Object.entries(appointmentData).filter(([_, value]) => value)
      );

      console.log("Filtered Appointment Data:", filteredAppointmentData); // Debug log

      await saveAppointmentToDatabase(filteredAppointmentData);
      alert("Appointment saved successfully!");
      onClose();
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert("Failed to save appointment. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book New Appointment</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <label>Pet Name</label>
            <Input
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
            />

            <label>Pet Type</label>
            <Input
              value={petType}
              onChange={(e) => setPetType(e.target.value)}
              placeholder="Enter pet type, e.g., Dog, Cat"
            />

            <label>Service</label>
            <Select onValueChange={handleServiceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pet Grooming">Pet Grooming</SelectItem>
                <SelectItem value="Veterinary Care">Veterinary Care</SelectItem>
                <SelectItem value="Pet Training">Pet Training</SelectItem>
                <SelectItem value="Pet Boarding">Pet Boarding</SelectItem>
              </SelectContent>
            </Select>

            <label>Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <label>Time</label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-4">
            <label>Species</label>
            <Input
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            />

            <label>Age</label>
            <Input
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter age (e.g., 3 weeks, 4 months)"
            />

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

            <label>Payment (₱)</label>
            <p className="text-lg font-semibold text-gray-700">₱{payment}</p>
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
