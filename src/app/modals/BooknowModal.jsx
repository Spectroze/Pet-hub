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
import { createUser, uploadPhoto, savePetToDatabase } from "../../lib/appwrite";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for react-toastify
import { saveAppointmentToDatabase } from "../../lib/appwrite";

export function BooknowModal({ showBooknowModal, setShowBooknowModal }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [payment, setPayment] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [missingFields, setMissingFields] = useState([]); // Track missing fields
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

   // Validation for Phone Number Format
   const validatePhoneNumber = (phone) => {
    const isValid =
      /^09\d{9}$/.test(phone) || // Format: 09XXXXXXXXX
      /^\+63\d{10}$/.test(phone); // Format: +63XXXXXXXXX
    return isValid;
  };

  // Handle input change with phone validation
  const handleInputChange = (setState) => (e) => {
    const { name, value } = e.target;

    // Only allow numeric input for the phone number
    if (name === "phone") {
      // If the user tries to input non-numeric or length > 11, prevent it
      if (!/^\d*$/.test(value) || value.length > 11) return;

      // Ensure the phone starts with "09" and is no more than 11 digits
      if (value.startsWith("0")) {
        setState((prev) => ({ ...prev, [name]: value }));
      } else if (value === "") {
        // Allow the user to clear the field
        setState((prev) => ({ ...prev, [name]: value }));
      } else {
        // Notify user that the phone number should start with "09"
        toast.error("Phone number must start with '09' and be 11 digits long.");
      }
    } else {
      // For other fields, update the state normally
      setState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);


  const handleNextStep = () => {
    const requiredFields = ["name", "email", "password", "phone"];
    const emptyFields = requiredFields.filter(
      (field) => !personalInfo[field] || (field === "phone" && personalInfo.phone.length !== 11)
    );

    if (emptyFields.length > 0) {
      toast.error(`Please fill out all required fields: ${emptyFields.join(", ")}`);
    } else {
      setStep(2);
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setPetInfo((prev) => ({
      ...prev,
      date: [selectedDate],
    }));

    if (selectedDate < currentDate) {
      toast.error("You can't select a past date."); // Display toast notification only
    } else {
      setDateError("");
    }
  };

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    setPetInfo((prev) => ({
      ...prev,
      time: [selectedTime],
    }));

    if (petInfo.date[0] === currentDate && selectedTime < currentTime) {
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
      clinic: [value], // Store selected clinic
      room: [], // Reset room selection when clinic changes
    }));
  };

  // Dynamically determine room options based on the selected clinic
  const getRoomOptions = () => {
    if (petInfo.clinic[0] === "Clinic 1") {
      return ["Room 1", "Room 2", "Room 3", "Room 4"];
    } else if (petInfo.clinic[0] === "Clinic 2") {
      return ["Room A", "Room B", "Room C", "Room D"];
    }
    return [];
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

  // Breed options for Dog and Cat types
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

  const getSpeciesOptions = () => {
    if (petInfo.type === "Dog") return dogBreeds;
    if (petInfo.type === "Cat") return catBreeds;
    return [];
  };

  return (
    <>
      <Dialog open={showBooknowModal} onOpenChange={setShowBooknowModal}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-blue-100 to-green-100 p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              Pet-care Appointment
            </DialogTitle>
          </DialogHeader>
          {missingFields.length > 0 && (
            <div className="text-red-500 mb-4">
              {`Please fill out the missing fields: ${missingFields.join(", ")}`}
            </div>
          )}

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
                  placeholder="Enter your Name"
                />
                <InputField
                  id="email"
                  name="email"
                  label="Email"
                  icon={<AtSign />}
                  value={personalInfo.email}
                  onChange={handleInputChange(setPersonalInfo)}
                  placeholder="Enter your Email Address"
                />
                   <PasswordField
                  id="password"
                  name="password"
                  label="Password"
                  value={personalInfo.password}
                  onChange={handleInputChange(setPersonalInfo)}
                  showPassword={showPassword}
                  toggleVisibility={togglePasswordVisibility}
                  placeholder="Enter your password"
                />
                 <InputField
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  icon={<Phone />}
                  value={personalInfo.phone}
                  onChange={handleInputChange(setPersonalInfo)}
                  placeholder="09XXXXXXXXX"
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
                    {/* Pet Type Selection */}
                    <SelectField
                      label="Pet Type"
                      options={["Dog", "Cat"]}
                      onChange={(value) => {
                        handleInputChange(setPetInfo)({
                          target: { name: "type", value },
                        });
                        setPetInfo((prev) => ({ ...prev, species: "" })); // Reset species on type change
                      }}
                    />

                    {/* Pet Species Dropdown - Disabled until Pet Type is selected */}
                    <SelectField
                      label="Pet Species"
                      options={getSpeciesOptions()}
                      onChange={(value) =>
                        handleInputChange(setPetInfo)({
                          target: { name: "species", value },
                        })
                      }
                      disabled={!petInfo.type}
                      placeholder={
                        !petInfo.type
                          ? "Select pet type first"
                          : "Select species"
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    {/* Combined Age with Unit */}
                    <Label htmlFor="age">Pet Age</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        value={petInfo.age || ""}
                        onChange={(e) =>
                          setPetInfo((prev) => ({
                            ...prev,
                            age: e.target.value,
                          }))
                        }
                        placeholder="Enter age"
                        className="flex-grow"
                      />
                      <Select
                        onValueChange={(value) =>
                          setPetInfo((prev) => ({ ...prev, ageUnit: value }))
                        }
                        className="min-w-[100px]"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Day(s)", "Week(s)", "Month(s)", "Year(s)"].map(
                            (unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

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
                      value={petInfo.date}
                      onChange={handleDateChange}
                      type="date"
                      min={currentDate}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                  <InputField
                    id="time"
                    name="time"
                    label="Appointment Time"
                    value={petInfo.time[0] || ""} // Display selected time or default
                    onChange={handleTimeChange}
                    type="time"
                    min={
                      petInfo.date[0] === currentDate ? currentTime : "00:00"
                    }
                  />

                  <SelectField
                    label="Pet Services"
                    options={[
                      "Pet Boarding",
                      "Pet Grooming",
                      "Pet Veterinary",
                      "Pet Training",
                    ]}
                    onChange={handleServiceChange}
                  />

                  {/* Clinic and Room selection with room dependency on clinic */}
                  {["Pet Boarding", "Pet Grooming", "Pet Veterinary"].includes(
                    petInfo.services[0]
                  ) && (
                    <>
                      <SelectField
                        label="Select Clinic"
                        options={["Clinic 1", "Clinic 2"]}
                        onChange={handleClinicChange}
                      />
                      <SelectField
                        label="Select Room"
                        options={getRoomOptions()}
                        onChange={handleRoomChange}
                        disabled={!petInfo.clinic.length} // Disable if no clinic selected
                        placeholder={
                          !petInfo.clinic.length
                            ? "Select clinic first"
                            : "Select room"
                        }
                      />
                    </>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold">Payment Summary</h3>
                  <p className="text-xl">Total Payment: ₱{payment}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleNextStep}
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
  placeholder,
}) {
  return (
    <InputField
      id={id}
      name={name}
      label={label}
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder} 
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

function SelectField({ label, options, onChange, disabled, placeholder }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue
            placeholder={placeholder || `Select ${label.toLowerCase()}`}
          />
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
