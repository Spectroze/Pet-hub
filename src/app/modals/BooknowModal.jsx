"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AtSign,
  Lock,
  PawPrint,
  Eye,
  EyeOff,
  Phone,
  Camera,
  Calendar as CalendarIcon,
  Clock,
  Loader2,
} from "lucide-react";
import { createUser } from "../../lib/appwrite";
import { toast } from "react-hot-toast";
import { saveAppointmentToDatabase } from "../../lib/appwrite";
import { uploadPhoto } from "../../lib/appwrite";
import { savePetToDatabase } from "../../lib/appwrite";

export function BooknowModal({ showBooknowModal, setShowBooknowModal }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [payment, setPayment] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    ownerPhoto: null,
  });

  const [petInfo, setPetInfo] = useState({
    name: "",
    type: "",
    species: "",
    age: "",
    photo: null,
    date: [], // Initialize as array
    time: [], // Initialize as array
    services: [], // Initialize as array
    clinic: [], // Initialize as array
    room: [], // Initialize as array
  });

  const servicePrices = {
    "Pet Boarding": 1000,
    "Pet Grooming": 500,
    "Pet Veterinary": 700,
    "Pet Training": 1200,
  };

  const currentDate = new Date().toISOString().split("T")[0];

  const getCurrentTime = () => {
    const now = new Date();
    return now.toISOString().split("T")[1].slice(0, 5);
  };

  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (petInfo.services.length > 0) {
      const selectedService = petInfo.services[0];
      const price = servicePrices[selectedService] || 0;
      setPayment(price);
    }
  }, [petInfo.services]);

  const handleInputChange = (setState) => (e) => {
    const { name, value, files } = e.target;
    setState((prev) =>
      name === "ownerPhoto" || name === "photo"
        ? { ...prev, [name]: files[0] }
        : { ...prev, [name]: value }
    );

    if (name === "date") {
      setDateError("");
    }
    if (name === "time") {
      setTimeError("");
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleNextStep = () => setStep(2);
  const handlePreviousStep = () => setStep(1);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setPetInfo((prev) => ({
      ...prev,
      date: prev.date.includes(selectedDate)
        ? prev.date
        : [...prev.date, selectedDate],
    }));

    if (selectedDate < currentDate) {
      setDateError("You can't select a past date.");
    } else {
      setDateError("");
    }
  };

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    setPetInfo((prev) => ({
      ...prev,
      time: prev.time.includes(selectedTime)
        ? prev.time
        : [...prev.time, selectedTime],
    }));

    if (petInfo.date.includes(currentDate) && selectedTime < currentTime) {
      setTimeError("You can't select a past time.");
    } else {
      setTimeError("");
    }
  };

  const handleServiceChange = (value) => {
    setPetInfo((prev) => ({
      ...prev,
      services: prev.services.includes(value)
        ? prev.services
        : [...prev.services, value],
    }));
  };

  const handleClinicChange = (value) => {
    setPetInfo((prev) => ({
      ...prev,
      clinic: prev.clinic.includes(value)
        ? prev.clinic
        : [...prev.clinic, value],
    }));
  };

  const handleRoomChange = (value) => {
    setPetInfo((prev) => ({
      ...prev,
      room: prev.room.includes(value) ? prev.room : [...prev.room, value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (dateError || timeError) {
        toast.error("Please fix the date and time errors before proceeding.");
        setIsLoading(false);
        return;
      }

      // Upload the pet photo if it exists and get the URL, fallback to a default URL if not available
      let petPhotoUrl = null;
      if (petInfo.photo) {
        petPhotoUrl = await uploadPhoto(petInfo.photo);
      }
      petPhotoUrl = petPhotoUrl || "/placeholder.svg"; // Fallback to placeholder if photo is missing

      // Ensure all required fields are arrays
      const finalPetInfo = {
        ...petInfo,
        date: Array.isArray(petInfo.date) ? petInfo.date : [petInfo.date],
        time: Array.isArray(petInfo.time) ? petInfo.time : [petInfo.time],
        services: Array.isArray(petInfo.services)
          ? petInfo.services
          : [petInfo.services],
        clinic: Array.isArray(petInfo.clinic)
          ? petInfo.clinic
          : [petInfo.clinic],
        room: Array.isArray(petInfo.room) ? petInfo.room : [petInfo.room],
      };

      // Create user and get ownerId
      const newUser = await createUser(
        personalInfo,
        finalPetInfo,
        "user",
        payment
      );
      const ownerId = newUser?.newUser?.accountId || newUser.$id;

      if (!ownerId) {
        throw new Error("Failed to retrieve owner ID for the pet data.");
      }

      // Prepare the pet data with ownerId and petPhotoUrl included
      const petData = {
        ownerId,
        petName: finalPetInfo.name,
        petType: finalPetInfo.type,
        petSpecies: finalPetInfo.species,
        petAge: finalPetInfo.age,
        petServices: finalPetInfo.services,
        petPhotoId: petPhotoUrl, // Ensure petPhotoUrl is assigned here
        petClinic: finalPetInfo.clinic,
        petRoom: finalPetInfo.room,
        petDate: finalPetInfo.date,
        petTime: finalPetInfo.time,
        petPayment: payment,
      };

      console.log("Pet data structure before saving:", petData);

      // Save pet data to the database
      await savePetToDatabase(petData);

      toast.success("Booking successful!");
      setShowBooknowModal(false);
      router.push("/user-dashboard");
    } catch (error) {
      console.error("Error during booking:", error.message);
      setError(error.message);
      toast.error("Booking failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={showBooknowModal} onOpenChange={setShowBooknowModal}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-blue-100 to-green-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              Pet-care Appointment
            </DialogTitle>
          </DialogHeader>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form className="space-y-4 py-4" onSubmit={handleSubmit}>
            {step === 1 ? (
              <>
                <InputField
                  id="name"
                  name="name"
                  label="Name"
                  icon={<PawPrint />}
                  value={personalInfo.name}
                  onChange={handleInputChange(setPersonalInfo)}
                  placeholder="Enter your name"
                />
                <InputField
                  id="email"
                  name="email"
                  label="Email"
                  icon={<AtSign />}
                  value={personalInfo.email}
                  onChange={handleInputChange(setPersonalInfo)}
                  placeholder="Enter your email"
                />
                <PasswordField
                  id="password"
                  name="password"
                  label="Password"
                  value={personalInfo.password}
                  onChange={handleInputChange(setPersonalInfo)}
                  showPassword={showPassword}
                  toggleVisibility={togglePasswordVisibility}
                />
                <InputField
                  id="phone"
                  name="phone"
                  label="Phone"
                  icon={<Phone />}
                  value={personalInfo.phone}
                  onChange={handleInputChange(setPersonalInfo)}
                  placeholder="Enter your phone number"
                />
                <InputField
                  id="owner-photo"
                  name="ownerPhoto"
                  label="Owner Photo"
                  icon={<Camera />}
                  type="file"
                  onChange={handleInputChange(setPersonalInfo)}
                />
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleNextStep}
                >
                  Next
                </Button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <InputField
                      id="pet-name"
                      name="name"
                      label="Pet Name"
                      icon={<PawPrint />}
                      value={petInfo.name}
                      onChange={handleInputChange(setPetInfo)}
                      placeholder="Enter pet's name"
                    />
                    <SelectField
                      label="Pet Type"
                      options={["Dog", "Cat"]}
                      onChange={(value) =>
                        handleInputChange(setPetInfo)({
                          target: { name: "type", value },
                        })
                      }
                    />
                    <InputField
                      id="pet-species"
                      name="species"
                      label="Pet Species"
                      icon={<PawPrint />}
                      value={petInfo.species}
                      onChange={handleInputChange(setPetInfo)}
                      placeholder="Enter pet's species"
                    />
                  </div>

                  <div className="space-y-4">
                    <InputField
                      id="pet-age"
                      name="age"
                      label="Pet Age"
                      icon={<CalendarIcon />}
                      value={petInfo.age}
                      onChange={handleInputChange(setPetInfo)}
                      placeholder="Enter pet's age"
                    />
                    <InputField
                      id="pet-photo"
                      name="photo"
                      label="Pet Photo"
                      icon={<Camera />}
                      type="file"
                      onChange={handleInputChange(setPetInfo)}
                    />
                    <InputField
                      id="date"
                      name="date"
                      label="Appointment Date"
                      icon={<CalendarIcon />}
                      value={petInfo.date}
                      onChange={handleDateChange}
                      type="date"
                      min={currentDate}
                    />
                    {dateError && <p className="text-red-500">{dateError}</p>}
                  </div>
                </div>

                <InputField
                  id="time"
                  name="time"
                  label="Appointment Time"
                  icon={<Clock />}
                  value={petInfo.time}
                  onChange={handleTimeChange}
                  type="time"
                  min={petInfo.date === currentDate ? currentTime : "00:00"}
                />
                {timeError && <p className="text-red-500">{timeError}</p>}
                <SelectField
                  label="Pet Services"
                  options={[
                    "Pet Boarding",
                    "Pet Grooming",
                    "Pet Veterinary",
                    "Pet Training",
                  ]}
                  onChange={(value) => handleServiceChange(value)}
                />

                {/* Show the clinic and room selection for specific services */}
                {["Pet Boarding", "Pet Grooming", "Pet Veterinary"].includes(
                  petInfo.services[0]
                ) && (
                  <>
                    <SelectField
                      label="Select Clinic"
                      options={["Clinic 1", "Clinic 2"]}
                      onChange={(value) => handleClinicChange(value)}
                    />
                    <SelectField
                      label="Select Room"
                      options={["Room 1", "Room 2", "Room 3", "Room 4"]}
                      onChange={(value) => handleRoomChange(value)}
                    />
                  </>
                )}

                <div className="mt-4">
                  <h3 className="text-lg font-bold">Payment Summary</h3>
                  <p className="text-xl">Total Payment: ₱{payment}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                  >
                    Back
                  </Button>
                  <Button type="submit">Submit</Button>
                </div>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>

      <LoadingModal isOpen={isLoading} />
    </>
  );
}

function LoadingModal({ isOpen }) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-blue-100 to-green-100">
        <div className="flex flex-col items-center justify-center p-6">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              times: [0, 0.5, 1],
              repeat: Infinity,
            }}
          >
            <PawPrint className="h-16 w-16 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold mt-4 mb-2">Booking in Progress</h2>
          <p className="text-center text-gray-600 mb-4">
            We're setting up your pet-care appointment. This may take a
            moment...
          </p>
          <div className="flex items-center">
            <Loader2 className="animate-spin h-5 w-5 mr-2 text-primary" />
            <span>Processing your request</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InputField({
  id,
  name,
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
        )}
        <Input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>
    </div>
  );
}

function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  showPassword,
  toggleVisibility,
}) {
  return (
    <InputField
      id={id}
      name={name}
      label={label}
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={onChange}
      icon={<Lock />}
    >
      <button
        type="button"
        onClick={toggleVisibility}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      >
        {showPassword ? <EyeOff /> : <Eye />}
      </button>
    </InputField>
  );
}

function SelectField({ label, options, onChange }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
