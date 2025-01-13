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
import { Checkbox } from "@/components/ui/checkbox";
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
  getAccount,
} from "../../lib/appwrite";
import { Client, Databases } from "appwrite";

const SERVICE_FEE = 20; // Service fee in PHP

const servicePayments = {
  "Pet Grooming": { price: 500, roles: ["Clinic"] },
  "Pet Veterinary": { price: 700, roles: ["Clinic"] },
  "Pet Boarding": { price: 1000, roles: ["pet-boarding", "Pet Boarding"] },
  "Pet Training": { price: 1200, roles: ["Pet Training"] },
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [rooms, setRooms] = useState({
    "Clinic 1": [],
    "Clinic 2": [],
  });
  const [customBreed, setCustomBreed] = useState("");
  const [customPetType, setCustomPetType] = useState("");
  const [availableClinics, setAvailableClinics] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [clinicRoles, setClinicRoles] = useState({}); // Store roles for each clinic

  const currentDate = new Date().toISOString().split("T")[0];
  const getCurrentTime = () =>
    new Date().toISOString().split("T")[1].slice(0, 5);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  const filterServicesByRole = (userRoles) => {
    // Normalize roles to array and lowercase for easier comparison
    const normalizedRoles = (
      Array.isArray(userRoles) ? userRoles : [userRoles]
    ).map((role) => role.toLowerCase());

    // Filter services based on user roles
    return Object.entries(servicePayments)
      .filter(([serviceName, serviceInfo]) => {
        const serviceRoles = serviceInfo.roles.map((role) =>
          role.toLowerCase()
        );
        return serviceRoles.some((role) =>
          normalizedRoles.some((userRole) =>
            userRole.includes(role.toLowerCase())
          )
        );
      })
      .map(([serviceName]) => serviceName);
  };

  useEffect(() => {
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
          // Determine collection ID based on clinic number
          const isEvenClinic = parseInt(clinic.match(/\d+/)[0]) % 2 === 0;
          const collectionId = isEvenClinic
            ? appwriteConfig.room2CollectionId
            : appwriteConfig.roomCollectionId;

          try {
            // Fetch rooms for this clinic
            const roomsResponse = await databases.listDocuments(
              appwriteConfig.databaseId,
              collectionId
            );

            // Map room numbers/letters based on clinic number
            roomsObj[clinic] = roomsResponse.documents
              .map((room) => {
                const roomIdentifier = isEvenClinic ? room.letter : room.number;
                if (roomIdentifier) {
                  return `Room ${roomIdentifier}`;
                }
                return null;
              })
              .filter(Boolean); // Remove any null values
          } catch (error) {
            console.error(`Error fetching rooms for ${clinic}:`, error);
            roomsObj[clinic] = []; // Set empty array if fetch fails
          }
        }

        setRooms(roomsObj);
      } catch (error) {
        console.error("Error fetching clinics:", error);
        toast.error("Failed to fetch clinic information");
      }
    };

    fetchClinicsAndRoles();
  }, []);

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

  const getSpeciesOptions = () => {
    if (petType === "Dog") return dogBreeds;
    if (petType === "Cat") return catBreeds;
    if (petType === "Others") return ["Others"];
    return [];
  };

  const handleClinicChange = (value) => {
    setPetClinic([value]);
    setPetRoom([]); // Reset room selection
    setPetServices([]); // Reset selected services

    // Update available services based on selected clinic's roles
    const clinicRolesList = clinicRoles[value] || [];
    const filteredServices = filterServicesByClinicRoles(clinicRolesList);
    setAvailableServices(filteredServices);
  };

  const handleRoomChange = (value) => {
    setPetRoom([value]);
  };

  const calculateTotalPayment = (services) => {
    const servicesTotal = services.reduce(
      (total, service) => total + servicePayments[service].price,
      0
    );
    return servicesTotal + SERVICE_FEE;
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
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const now = new Date();
    const selectedDateTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );

    // Check if the selected date is today
    const isToday = petDate[0] === currentDate;

    // Check if the time is between 8:00 AM and 5:00 PM
    const isWithinBusinessHours = hours >= 8 && hours < 17;

    // Check if the selected time is in the future
    const isInFuture = selectedDateTime > now;

    if (!isWithinBusinessHours) {
      setTimeError(
        "Appointments are only available between 8:00 AM and 5:00 PM."
      );
      toast.error(
        "Appointments are only available between 8:00 AM and 5:00 PM."
      );
      return;
    }

    if (isToday && !isInFuture) {
      setTimeError("You can't select a past time for today's appointments.");
      toast.error("You can't select a past time for today's appointments.");
      return;
    }

    setPetTime([selectedTime]);
    setTimeError("");
  };

  const handleServiceChange = (service, checked) => {
    if (checked) {
      setPetServices((prev) => [...prev, service]);
    } else {
      setPetServices((prev) => prev.filter((s) => s !== service));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (
        !petType ||
        !petSpecies ||
        petServices.length === 0 ||
        !petClinic.length ||
        !petRoom.length
      ) {
        toast.error("Please fill in all required fields.");
        setLoading(false);
        return;
      }
      if (dateError || timeError) {
        toast.error("Please fix the date and time errors before proceeding.");
        setLoading(false);
        return;
      }

      const currentAccount = await getAccount();
      const ownerId = currentAccount.$id;

      let petPhotoId = "/placeholder.svg";
      if (petPhoto) {
        petPhotoId = await uploadFileAndGetUrl(petPhoto);
      }

      const ageWithUnit = `${petAge} ${petAgeUnit || ""}`.trim();

      const updatedPetDate =
        petDate.length > 0
          ? [
              new Date(
                new Date(petDate[0]).toISOString().split("T")[0] +
                  "T" +
                  (petTime.length > 0 ? petTime[0] : "00:00:00.000+00:00")
              ).toISOString(),
            ]
          : [];

      const finalPetType = petType === "Others" ? customPetType : petType;
      const finalPetSpecies =
        petSpecies === "Others" ? customBreed : petSpecies;

      const newPet = {
        ownerId,
        petName,
        petAge: ageWithUnit,
        petType: finalPetType,
        petSpecies: finalPetSpecies,
        petServices,
        petDate: updatedPetDate,
        petTime,
        petClinic,
        petRoom,
        petPayment,
        petPhotoId,
        status: ["Pending"],
        status_reading: "unread",
        servicesFee: SERVICE_FEE,
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
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-blue-100 to-green-100 grid grid-cols-2 gap-3 p-4">
        <DialogHeader className="col-span-2">
          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <PawPrint className="w-6 h-6" />
            <span>Add New Pet</span>
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="col-span-2 grid grid-cols-2 gap-6"
        >
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
                  name="age"
                  type="number"
                  value={petAge}
                  onChange={(e) => setPetAge(e.target.value)}
                  placeholder="Enter age"
                  className="flex-grow h-10"
                  required
                />
                <Select
                  onValueChange={(value) => setPetAgeUnit(value)}
                  className="min-w-[100px] h-10"
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Day",
                      "Days",
                      "Week",
                      "Weeks",
                      "Month",
                      "Months",
                      "Year",
                      "Years",
                    ].map((unit) => (
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
              <Select
                onValueChange={(value) => {
                  setPetType(value);
                  setPetSpecies("");
                  setCustomBreed("");
                  if (value !== "Others") {
                    setCustomPetType("");
                  }
                }}
                className="h-10"
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type of pet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dog">Dog</SelectItem>
                  <SelectItem value="Cat">Cat</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>

              {petType === "Others" && (
                <div className="mt-2">
                  <Input
                    placeholder="Enter pet type"
                    value={customPetType}
                    onChange={(e) => setCustomPetType(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="petClinic">Pet Clinic</Label>
              <Select
                onValueChange={handleClinicChange}
                className="h-10"
                placeholder="Select clinic"
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select clinic" />
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
            {petClinic.length > 0 && availableServices.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="petServices">Pet Services</Label>
                <div
                  className="border rounded-md p-2 bg-white cursor-pointer"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {petServices.length > 0
                    ? petServices.join(", ")
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
                          checked={petServices.includes(service)}
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
            {petServices.length > 0 && (
              <div className="mt-2">
                <Label>Payment Amount:</Label>
                <div className="font-semibold text-gray-700">
                  {petServices
                    .map((service) => `₱${servicePayments[service].price}`)
                    .join(", ")}
                </div>
                <div className="text-sm text-gray-600">
                  Service Fee: ₱{SERVICE_FEE}
                </div>
                <div className="font-bold mt-1">Total: ₱{petPayment}</div>
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="petDate">Appointment Date</Label>
              <Input
                id="petDate"
                className="h-10"
                type="date"
                onChange={handleDateChange}
                min={currentDate}
                required
              />
            </div>
            <div>
              <Label htmlFor="petTime">Appointment Time</Label>
              <Input
                id="petTime"
                className="h-10"
                type="time"
                onChange={handleTimeChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="petSpecies">Pet Breed</Label>
              <Select
                onValueChange={(value) => {
                  setPetSpecies(value);
                  if (value !== "Others") {
                    setCustomBreed("");
                  }
                }}
                disabled={!petType}
                className="h-10"
                required
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !petType ? "Select pet type first" : "Select breed"
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

              {petSpecies === "Others" && (
                <div className="mt-2">
                  <Input
                    placeholder="Enter custom breed"
                    value={customBreed}
                    onChange={(e) => setCustomBreed(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="petPhoto">Pet Photo</Label>
              <Input
                id="petPhoto"
                className="h-10"
                type="file"
                accept="image/*"
                onChange={(e) => setPetPhoto(e.target.files[0])}
                required
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
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms[petClinic[0]]?.filter(Boolean).map((roomName) => (
                    <SelectItem key={roomName} value={roomName}>
                      {roomName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="col-span-2 mt-4 w-full"
            disabled={loading}
          >
            {loading ? "Saving..." : "Add Pet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
