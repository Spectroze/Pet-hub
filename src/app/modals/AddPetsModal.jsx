"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PawPrint } from "lucide-react";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  uploadFileAndGetUrl,
  savePetToDatabase,
  getCurrentUser,
} from "../../lib/appwrite";

const servicePayments = {
  "Pet Grooming": 500,
  "Pet Veterinary": 700,
  "Pet Boarding": 1000,
  "Pet Training": 1200,
};

const dogBreeds = [
  "Labrador Retriever",
  "German Shepherd",
  "Golden Retriever",
  "Bulldog",
  "Poodle",
  "Beagle",
  "Rottweiler",
  "Dachshund",
  "Shih Tzu",
  "Boxer",
  "Others",
];

const catBreeds = [
  "Siamese",
  "Persian",
  "Maine Coon",
  "Bengal",
  "Sphynx",
  "Ragdoll",
  "Scottish Fold",
  "Abyssinian",
  "Burmese",
  "Russian Blue",
  "Others",
];

export default function AddPetModal({
  showAddPetModal,
  setShowAddPetModal,
  handleAddPet,
}) {
  const [petName, setPetName] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petAgeUnit, setPetAgeUnit] = useState("");
  const [petType, setPetType] = useState("");
  const [petSpecies, setPetSpecies] = useState("");
  const [petServices, setPetServices] = useState([]);
  const [petDate, setPetDate] = useState([]);
  const [petTime, setPetTime] = useState([]);
  const [petClinic, setPetClinic] = useState([]);
  const [petRoom, setPetRoom] = useState([]);
  const [petPayment, setPetPayment] = useState(0);
  const [petPhoto, setPetPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");

  const currentDate = new Date().toISOString().split("T")[0];
  const getCurrentTime = () => new Date().toISOString().split("T")[1].slice(0, 5);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  const getSpeciesOptions = () => {
    if (petType === "Dog") return dogBreeds;
    if (petType === "Cat") return catBreeds;
    return [];
  };

  const getRoomOptions = () => {
    if (petClinic[0] === "Clinic 1") {
      return ["Room 1", "Room 2", "Room 3", "Room 4"];
    } else if (petClinic[0] === "Clinic 2") {
      return ["Room A", "Room B", "Room C", "Room D"];
    }
    return [];
  };

  const handleClinicChange = (value) => {
    setPetClinic([value]);
    setPetRoom([]); // Reset room selection when clinic changes
  };

  const handleRoomChange = (value) => {
    setPetRoom([value]);
  };

  const calculateTotalPayment = (services) => {
    return services.reduce(
      (total, service) => total + servicePayments[service],
      0
    );
  };

  useEffect(() => {
    setPetPayment(calculateTotalPayment(petServices));
  }, [petServices]);

  const handleArrayChange = (setter, value) => {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setPetDate([selectedDate]);

    if (selectedDate < currentDate) {
      setDateError("You can't select a past date.");
      toast.error("You can't select a past date.");
    } else {
      setDateError("");
    }
  };

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    setPetTime([selectedTime]);

    if (petDate[0] === currentDate && selectedTime < currentTime) {
      setTimeError("You can't select a past time.");
      toast.error("You can't select a past time.");
    } else {
      setTimeError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (dateError || timeError) {
        toast.error("Please fix the date and time errors before proceeding.");
        setLoading(false);
        return;
      }

      const currentUser = await getCurrentUser();
      const ownerId = currentUser.$id;

      let petPhotoId = "/placeholder.svg";
      if (petPhoto) {
        petPhotoId = await uploadFileAndGetUrl(petPhoto);
      }

      const newPet = {
        ownerId,
        petName,
        petAge,
        petAgeUnit,
        petType,
        petSpecies,
        petServices,
        petDate,
        petTime,
        petClinic,
        petRoom,
        petPayment,
        petPhotoId,
      };

      await savePetToDatabase(newPet);
      handleAddPet(newPet);
      toast.success(`Pet ${petName} added successfully!`);
      setShowAddPetModal(false);
    } catch (error) {
      console.error("Add pet error:", error);
      toast.error("An error occurred while saving the pet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showAddPetModal} onOpenChange={setShowAddPetModal}>
<DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-blue-100 to-green-100 grid grid-cols-2 gap-3 p-4">  <DialogHeader className="col-span-2">
    <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
      <PawPrint className="w-6 h-6" />
      <span>Add New Pet</span>
    </DialogTitle>
  </DialogHeader>

  <form onSubmit={handleSubmit} className="col-span-2 grid grid-cols-2 gap-6">
    {/* Left Side */}
    <div className="space-y-4">
      <div>
        <Label htmlFor="petName">Pet Name</Label>
        <Input
          id="petName"
          className="h-10"
          value={petName}
          onChange={(e) => setPetName(e.target.value)}
          required
          placeholder="Enter your pet's name"
        />
      </div>
      <div>
        <Label htmlFor="age">Pet Age</Label>
        <div className="flex items-center gap-2">
          <Input
            id="age"
            className="h-10"
            name="age"
            type="number"
            value={petAge || ""}
            onChange={(e) => setPetAge(e.target.value)}
            placeholder="Enter age"
          />
          <Select onValueChange={(value) => setPetAgeUnit(value)} className="h-10 min-w-[100px]">
            <SelectTrigger>
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              {["Day(s)", "Week(s)", "Month(s)", "Year(s)"].map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="petType">Pet Type</Label>
        <Select onValueChange={(value) => setPetType(value)} className="h-10">
          <SelectTrigger>
            <SelectValue placeholder="Select type of pet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Dog">Dog</SelectItem>
            <SelectItem value="Cat">Cat</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
            <Label htmlFor="petClinic">Pet Clinic</Label>
            <Select
              onValueChange={handleClinicChange}
              className="h-10"
              placeholder="Select clinic"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select clinic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Clinic 1">Clinic 1</SelectItem>
                <SelectItem value="Clinic 2">Clinic 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
      <div>
        <Label htmlFor="petServices">Pet Services</Label>
        <Select
          multiple
          className="h-10"
          onValueChange={(value) => handleArrayChange(setPetServices, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select services for your pet" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(servicePayments).map((service) => (
              <SelectItem key={service} value={service}>
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {petServices.length > 0 && (
        <div className="mt-2">
          <Label>Payment Amount:</Label>
          <div className="font-semibold text-gray-700">
            {petServices
              .map((service) => `${servicePayments[service]} PHP`)
              .join(", ")}
          </div>
          <div>Total: {petPayment} PHP</div>
        </div>
      )}
    </div>

    {/* Right Side */}
    <div className="space-y-4">
      <div>
        <Label htmlFor="petDate">Pet Date</Label>
        <Input
          id="petDate"
          className="h-10"
          type="date"
          onChange={handleDateChange}
          min={currentDate}
        />
      </div>
      <div>
        <Label htmlFor="petTime">Pet Time</Label>
        <Input
          id="petTime"
          className="h-10"
          type="time"
          onChange={handleTimeChange}
          min={petDate[0] === currentDate ? currentTime : "00:00"}
        />
      </div>
      <div>
        <Label htmlFor="petSpecies">Pet Species</Label>
        <Select
          onValueChange={(value) => setPetSpecies(value)}
          disabled={!petType}
          className="h-10"
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                !petType ? "Select pet type first" : "Select species"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {getSpeciesOptions().map((species) => (
              <SelectItem key={species} value={species}>
                {species}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="petPhoto">Pet Photo</Label>
        <Input
          id="petPhoto"
          className="h-10"
          type="file"
          accept="image/*"
          onChange={(e) => setPetPhoto(e.target.files[0])}
        />
      </div>
      <div>
            <Label htmlFor="petRoom">Pet Room</Label>
            <Select
              onValueChange={handleRoomChange}
              disabled={!petClinic.length}
              className="h-10"
              placeholder={
                !petClinic.length ? "Select clinic first" : "Select room"
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                {getRoomOptions().map((room) => (
                  <SelectItem key={room} value={room}>
                    {room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
      

      {/* Clinic and Room Selection - Conditional Rendering */}
      {["Pet Boarding", "Pet Grooming", "Pet Veterinary"].includes(
        petServices[0]
      ) && (
        <>
        </>
      )}
    </div>

    <Button type="submit" className="col-span-2 mt-4 w-full" disabled={loading}>
      {loading ? "Saving..." : "Add Pet"}
    </Button>
  </form>
</DialogContent>

    </Dialog>
  );
}
