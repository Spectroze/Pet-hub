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
import { Client, Databases, Query } from "appwrite";
import { toast } from "react-toastify";

// Appwrite configuration
const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "67094c000023e950be96",
  databaseId: "670a040f000893eb8e06",
  petCollectionId: "670ab2db00351bc09a92",
  bucketId: "670ab439002597c2ae84",
  roomCollectionId: "6738afcd000d644b6853",
  room2CollectionId: "674dace4000dcbb1badf",
  userCollectionId: "670a04240019b97fcf05",
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

const servicePayments = {
  "Pet Grooming": { price: 500, roles: ["Clinic"] },
  "Pet Veterinary": { price: 700, roles: ["Clinic"] },
  "Pet Boarding": { price: 1000, roles: ["pet-boarding", "Pet Boarding"] },
  "Pet Training": { price: 1200, roles: ["Pet Training"] },
};

const SERVICE_FEE = 20; // Service fee in pesos

export default function NewAppointmentModal({ isOpen, onClose, pets }) {
  const [services, setServices] = useState([]);
  const [date, setDate] = useState(getCurrentDate());
  const [time, setTime] = useState(getCurrentTime());
  const [clinic, setClinic] = useState("");
  const [room, setRoom] = useState("");
  const [payment, setPayment] = useState("0");
  const [selectedPets, setSelectedPets] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [rooms, setRooms] = useState({
    "Clinic 1": [],
    "Clinic 2": [],
  });
  const [isPetTrainingSelected, setIsPetTrainingSelected] = useState(false);
  const [selectedPetsWithPhotos, setSelectedPetsWithPhotos] = useState([]);
  const [availableClinics, setAvailableClinics] = useState([]);
  const [clinicRoles, setClinicRoles] = useState({});
  const [availableServices, setAvailableServices] = useState([]);

  const servicesOptions = [
    "Pet Grooming",
    "Pet Veterinary",
    "Pet Training",
    "Pet Boarding",
  ];

  useEffect(() => {
    if (isOpen && pets) {
      // Ensure pets have all required fields including petPhotoId
      const validatedPets = pets.map((pet) => ({
        ...pet,
        petPhotoId: pet.petPhotoId || null, // Ensure petPhotoId exists
      }));
      setSelectedPets(validatedPets);
    }
  }, [isOpen, pets]);

  const checkFormValidity = useCallback(() => {
    const isValid =
      services.length > 0 &&
      date.trim() !== "" &&
      time.trim() !== "" &&
      Number(payment) > 0 &&
      selectedPets.length > 0 &&
      (isPetTrainingSelected || (clinic.trim() !== "" && room.trim() !== ""));
    setIsFormValid(isValid);
  }, [
    services,
    date,
    time,
    clinic,
    room,
    payment,
    isPetTrainingSelected,
    selectedPets,
  ]);

  useEffect(() => {
    checkFormValidity();
  }, [
    services,
    date,
    time,
    clinic,
    room,
    payment,
    selectedPets,
    checkFormValidity,
  ]);

  const filterServicesByClinicRoles = (roles) => {
    if (!roles) return [];

    const normalizedRoles = roles.map((role) => role.toLowerCase());

    return Object.entries(servicePayments)
      .filter(([serviceName, serviceInfo]) => {
        const serviceRoles = serviceInfo.roles.map((role) =>
          role.toLowerCase()
        );
        return serviceRoles.some((role) =>
          normalizedRoles.some((userRole) =>
            userRole.toLowerCase().includes(role)
          )
        );
      })
      .map(([serviceName]) => serviceName);
  };

  useEffect(() => {
    if (isOpen) {
      // Only fetch when modal is open
      fetchClinicsAndRoles();
    }
  }, [isOpen]);

  const fetchClinicsAndRoles = async () => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId
      );

      // Create a map of clinic to their roles
      const clinicRolesMap = {};
      response.documents.forEach((user) => {
        const roles = Array.isArray(user.role) ? user.role : [user.role];
        roles.forEach((role) => {
          const clinicMatch = role.match(/Clinic \d+/);
          if (clinicMatch) {
            const clinicName = clinicMatch[0];
            if (!clinicRolesMap[clinicName]) {
              clinicRolesMap[clinicName] = new Set();
            }
            // Add all roles for this clinic
            roles.forEach((r) => clinicRolesMap[clinicName].add(r));
          }
        });
      });

      // Convert Sets to Arrays
      Object.keys(clinicRolesMap).forEach((clinic) => {
        clinicRolesMap[clinic] = Array.from(clinicRolesMap[clinic]);
      });

      setClinicRoles(clinicRolesMap);

      // Extract unique clinic names and sort them
      const uniqueClinics = Object.keys(clinicRolesMap).sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
      });

      setAvailableClinics(uniqueClinics);

      // Initialize rooms state with dynamic clinic keys
      const roomsObj = {};
      for (const clinic of uniqueClinics) {
        const clinicNumber = parseInt(clinic.match(/\d+/)[0]);
        const collectionId =
          clinicNumber % 2 === 1
            ? appwriteConfig.roomCollectionId
            : appwriteConfig.room2CollectionId;

        // Fetch rooms for this clinic
        const roomsResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          collectionId
        );

        // Map room numbers/letters based on clinic number
        roomsObj[clinic] = roomsResponse.documents.map(
          (room) => `Room ${clinicNumber % 2 === 1 ? room.number : room.letter}`
        );
      }

      setRooms(roomsObj);
    } catch (error) {
      console.error("Error fetching clinics:", error);
      toast.error("Failed to fetch clinic information");
    }
  };

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

    // Update isPetTrainingSelected
    setIsPetTrainingSelected(updatedServices.includes("Pet Training"));

    // If Pet Training is selected, clear clinic and room
    if (updatedServices.includes("Pet Training")) {
      setClinic("");
      setRoom("");
    }

    // Calculate total payment including service fee
    const servicesTotal = updatedServices.reduce((sum, service) => {
      return sum + (servicePayments[service]?.price || 0);
    }, 0);
    const totalWithFee =
      servicesTotal + (updatedServices.length > 0 ? SERVICE_FEE : 0);
    setPayment(totalWithFee.toString());
  };

  const handleRoomSelect = (selectedRoom) => {
    setRoom(selectedRoom);
  };

  const handleSave = async () => {
    try {
      const ownerId = await getCurrentUserId();
      if (!ownerId) throw new Error("User ID not retrieved");

      // Ensure we have selected pets
      if (!selectedPets || selectedPets.length === 0) {
        throw new Error("Please select at least one pet");
      }

      // Combine date and time to create a full timestamp
      const combinedDateTime = new Date(`${date}T${time}`);

      // Create an appointment for each selected pet
      const appointmentPromises = selectedPets.map(async (pet) => {
        const appointmentData = {
          petName: pet.petName,
          petType: pet.petType,
          petSpecies: pet.petSpecies,
          petAge: pet.petAge,
          petPhotoId: pet.petPhotoId,
          petServices: services,
          petDate: [combinedDateTime.toISOString()],
          petTime: [time],
          ownerId,
          status: ["Pending"],
          petPayment: Number(payment),
          status_reading: "unread",
          servicesFee: services.length > 0 ? SERVICE_FEE : 0, // Add service fee
        };

        // Only include clinic and room if not Pet Training
        if (!isPetTrainingSelected) {
          appointmentData.petClinic = [clinic];
          appointmentData.petRoom = [room];
        }

        // Validate required fields
        const requiredFields = [
          "petName",
          "petType",
          "petPhotoId",
          "petServices",
          "petDate",
          "petTime",
          "ownerId",
        ];

        for (const field of requiredFields) {
          if (
            appointmentData[field] === undefined ||
            appointmentData[field] === null
          ) {
            throw new Error(
              `Missing required field: ${field} for pet ${pet.petName}`
            );
          }
        }

        console.log(
          `Saving appointment data for ${pet.petName}:`,
          appointmentData
        );
        return saveAppointmentToDatabase(appointmentData);
      });

      // Wait for all appointments to be saved
      await Promise.all(appointmentPromises);

      toast.success(
        `Appointments saved successfully for ${selectedPets.length} pet(s)!`
      );
      onClose();
    } catch (error) {
      console.error("Error saving appointments:", error.response || error);
      const errorMessage =
        error.response?.message ||
        error.message ||
        "Failed to save appointments";
      toast.error(errorMessage);

      // Log detailed error information
      if (error.response) {
        console.error("Detailed error:", {
          message: error.response.message,
          code: error.response.code,
          type: error.response.type,
        });
      }
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);

    if (selectedDate < getCurrentDate()) {
      toast.error("You can't select a past date.");
    }
  };

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const selectedDateTime = new Date(`${date}T${selectedTime}`);
    const currentDateTime = new Date();

    // Check if time is between 8 AM and 5 PM
    if (hours < 8 || (hours === 17 && minutes > 0) || hours > 17) {
      toast.error(
        "Appointments are only available between 8:00 AM and 5:00 PM."
      );
      return;
    }

    // Check if the selected date and time is in the past
    if (selectedDateTime < currentDateTime) {
      toast.error("You can't select a past time.");
      return;
    }

    setTime(selectedTime);
  };

  // Fetch pet details including photos when modal opens or pets change
  useEffect(() => {
    const fetchPetDetails = async () => {
      try {
        if (!pets || pets.length === 0) return;

        // Fetch full pet details for each selected pet
        const petsData = await Promise.all(
          pets.map(async (pet) => {
            try {
              // Fetch the pet document from the collection
              const petDoc = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.petCollectionId,
                pet.$id // Assuming each pet has an $id field
              );

              // Return pet with photo URL
              return {
                ...petDoc,
                photoUrl: petDoc.petPhotoId
                  ? `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.bucketId}/files/${petDoc.petPhotoId}/view?project=${appwriteConfig.projectId}`
                  : null,
              };
            } catch (error) {
              console.error(
                `Error fetching pet details for ${pet.petName}:`,
                error
              );
              return pet; // Return original pet data if fetch fails
            }
          })
        );

        setSelectedPetsWithPhotos(petsData);
      } catch (error) {
        console.error("Error fetching pet details:", error);
        toast.error("Failed to load pet details");
      }
    };

    if (isOpen && pets) {
      fetchPetDetails();
    }
  }, [isOpen, pets]);

  const handleClinicChange = (value) => {
    setClinic(value);
    setRoom(""); // Reset room selection
    setServices([]); // Reset selected services

    // Update available services based on selected clinic's roles
    const clinicRolesList = clinicRoles[value] || [];
    const filteredServices = filterServicesByClinicRoles(clinicRolesList);
    setAvailableServices(filteredServices);
  };

  const handleRoomChange = (value) => {
    setRoom(value);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-4 rounded-lg w-full max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Book New Appointment</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            {selectedPetsWithPhotos.map((pet, index) => (
              <div key={index} className="border p-2 rounded">
                <p>Pet Name: {pet.petName}</p>
                <p>Pet Type: {pet.petType}</p>
                <p>Pet Species: {pet.petSpecies}</p>
                <p>Pet Age: {pet.petAge}</p>
                {pet.photoUrl && (
                  <div className="relative w-20 h-20 mt-2">
                    <img
                      src={pet.petPhotoId}
                      alt={`${pet.petName}'s photo`}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        console.error("Error loading image:", e);
                        e.target.src = "/fallback-pet-image.png"; // Optional: provide a fallback image
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {clinic && availableServices.length > 0 && (
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
                  <div className="absolute z-10 mt-2 bg-white shadow-md rounded-md w-64">
                    {availableServices.map((service) => (
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
                          {service} - ₱{servicePayments[service].price}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label>Clinic</label>
              <Select onValueChange={handleClinicChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a clinic" />
                </SelectTrigger>
                <SelectContent>
                  {availableClinics.map((clinicName) => (
                    <SelectItem key={clinicName} value={clinicName}>
                      {clinicName} ({rooms[clinicName]?.length || 0} rooms)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isPetTrainingSelected && (
              <>
                <div className="space-y-2">
                  <label>Room</label>
                  <Select value={room} onValueChange={handleRoomChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms[clinic]?.map((roomOption) => (
                        <SelectItem key={roomOption} value={roomOption}>
                          {roomOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <label>Date</label>
              <Input
                type="date"
                value={date}
                onChange={handleDateChange}
                min={getCurrentDate()}
              />
            </div>

            <div>
              <label>Time</label>
              <Input
                type="time"
                value={time}
                onChange={handleTimeChange}
                min={date === getCurrentDate() ? getCurrentTime() : "08:00"}
                max="17:00"
              />
            </div>

            <div>
              <label>Payment Details</label>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  Services Total: ₱
                  {services.reduce(
                    (sum, service) => sum + servicePayments[service].price,
                    0
                  )}
                </p>
                {services.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Service Fee: ₱{SERVICE_FEE}
                  </p>
                )}
                <p className="text-lg font-semibold text-gray-700">
                  Total: ₱{payment}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isFormValid}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
