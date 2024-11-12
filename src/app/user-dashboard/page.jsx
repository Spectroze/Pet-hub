"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { appwriteConfig } from "@/lib/appwrite";
import { fetchUserAndPetInfo, getCurrentUser } from "@/lib/appwrite";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import AddPetModal from "../modals/AddPetsModal";
import { motion } from "framer-motion";
import NewAppointmentModal from "@/app/modals/newAppointmentModal";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToastContainer, toast } from "react-toastify";
import {
  Edit,
  PawPrint,
  Menu as MenuIcon,
  Home,
  CalendarIcon,
  Bell as NotificationIcon,
  Star as FeedbackIcon,
  Settings as SettingsIcon,
  PlusCircle,
} from "lucide-react";

import { Client, Databases } from "appwrite";

const client = new Client();
client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);
const databases = new Databases(client);

import Appointment from "./appointment/page";
import Notification from "./notification/page";
import Feedback from "./feedback/page";
import Setting from "./setting/page";

export default function PetCareDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const [ownerInfo, setOwnerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
    avatarUrl: "/placeholder.svg",
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pets, setPets] = useState([]);
  const [isEditingPet, setIsEditingPet] = useState(null);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  const handleAddPet = async (newPet) => {
    try {
      const petPhotoUrl = newPet?.petPhotoId
        ? `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.bucketId}/files/${newPet.petPhotoId}/view?project=${appwriteConfig.projectId}`
        : "/placeholder.svg";

      setPets((prevPets) => [
        ...prevPets,
        {
          name: newPet?.petName || "No Name",
          type: newPet?.petType || "No Type",
          age: newPet?.petAge || "No Age",
          species: newPet?.petSpecies || "None",
          carePlan: newPet?.petServices || "No Plan",
          petPhoto: petPhotoUrl,
        },
      ]);
    } catch (error) {}
  };

  const toggleEditOwner = () => setIsEditingOwner((prev) => !prev);

  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    setOwnerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveOwner = async () => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId,
        {
          name: ownerInfo.name,
          email: ownerInfo.email,
          phone: ownerInfo.phone,
        }
      );
      setIsEditingOwner(false);
      toast.success("Profile updated successfully!"); // Show success toast
    } catch (error) {
      console.error("Error updating owner:", error);
      toast.error("Failed to update profile."); // Show error toast
    }
  };
  const handleEditPet = (index) => setIsEditingPet(index);

  const handlePetChange = (e, index) => {
    const { name, value } = e.target;
    setPets((prevPets) =>
      prevPets.map((pet, i) => (i === index ? { ...pet, [name]: value } : pet))
    );
  };
  const handleSavePet = async (index) => {
    try {
      const pet = pets[index];

      // Check if the pet object has an `id` property
      if (!pet.id) {
        throw new Error("Missing document ID for the pet.");
      }

      // Update the pet details in the Appwrite database
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId,
        pet.id, // Use the pet's unique ID for the update
        {
          petName: pet.name,
          petType: pet.type,
          petAge: pet.age,
          petSpecies: pet.species,
          petServices: pet.carePlan,
        }
      );

      setIsEditingPet(null); // Exit editing mode after saving
      toast.success("Pet details saved successfully!"); // Show a success toast
    } catch (error) {
      console.error("Error saving pet details:", error);
      toast.error("Failed to save pet details. Please try again."); // Show an error toast
    }
  };

  useEffect(() => {
    const loadPets = async () => {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.petCollectionId
        );
        // Map over the documents to ensure each pet object includes the `id` property
        setPets(
          response.documents.map((doc) => ({
            ...doc,
            id: doc.$id, // Assign Appwrite's `$id` to `id`
          }))
        );
      } catch (error) {
        console.error("Error loading pets:", error);
      }
    };
  });
  const openNewAppointmentModal = (pet) => {
    setSelectedPet(pet);
    setShowNewAppointmentModal(true);
  };

  const closeNewAppointmentModal = () => {
    setShowNewAppointmentModal(false);
    setSelectedPet(null);
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser && currentUser.$id) {
          setUserId(currentUser.$id);
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error fetching current user: ", err);
        router.push("/");
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        const { user, pet } = await fetchUserAndPetInfo(userId);

        setOwnerInfo({
          ...user,
          avatarUrl: user.avatar || "/placeholder.svg",
        });

        const petPhotoUrl = pet?.petPhotoId?.startsWith("http")
          ? pet.petPhotoId
          : `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.bucketId}/files/${pet.petPhotoId}/view?project=${appwriteConfig.projectId}`;

        setPets([
          {
            name: pet?.petName || "No Name",
            type: pet?.petType || "No Type",
            age: pet?.petAge || "No Age",
            species: pet?.petSpecies || "None",
            carePlan: pet?.petServices || "No Plan",
            petPhoto: petPhotoUrl,
          },
        ]);
      } catch (error) {
        setError("Failed to load user or pet data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const navItems = [
    { icon: PawPrint, title: "My Pet's", id: "overview" },
    { icon: CalendarIcon, title: "Appointments", id: "appointment" },
    { icon: NotificationIcon, title: "Notifications", id: "notification" },
    { icon: FeedbackIcon, title: "Feedback", id: "feedback" },
    { icon: SettingsIcon, title: "Settings", id: "setting" },
  ];

  const PawPrintLoader = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <div className="relative">
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
          <PawPrint className="h-24 w-24 text-white " />
        </motion.div>
      </div>
      <p className="mt-4 text-lg font-medium text-white animate-pulse">
        Loading your pet paradise...
      </p>
    </div>
  );

  if (loading) {
    return <PawPrintLoader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-gray-800 ${
          sidebarOpen ? "w-64" : "w-20"
        } min-h-screen p-4 flex flex-col relative transition-all`}
      >
        <Button
          variant="outline"
          className={`absolute top-4 right-4 transition-all ${
            sidebarOpen ? "mr-2" : "ml-0"
          } bg-gray-700 text-gray-200 hover:bg-gray-600`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>

        <div className="flex flex-col items-center mt-16 space-y-2">
          {/* Avatar with onClick handler to toggle editing */}
          <Avatar
            className="h-20 w-20 border-2 border-gray-600 cursor-pointer"
            onClick={toggleEditOwner}
          >
            <AvatarImage src={ownerInfo.avatarUrl} alt="User" />
            <AvatarFallback>{ownerInfo.name?.[0] || "U"}</AvatarFallback>
          </Avatar>

          {sidebarOpen && (
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-200">
                {ownerInfo.name || "Guest"}
              </p>
              <p className="text-xs text-gray-400">Pet Parent</p>

              {isEditingOwner ? (
                <>
                  <Input
                    name="name"
                    value={ownerInfo.name}
                    onChange={handleOwnerChange}
                    placeholder="Name"
                    className="mt-2 bg-gray-700 text-gray-100"
                  />
                  <Input
                    name="email"
                    value={ownerInfo.email}
                    onChange={handleOwnerChange}
                    placeholder="Email"
                    className="mt-2 bg-gray-700 text-gray-100"
                  />
                  <Input
                    name="phone"
                    value={ownerInfo.phone}
                    onChange={handleOwnerChange}
                    placeholder="Phone"
                    className="mt-2 bg-gray-700 text-gray-100"
                  />
                  <Button
                    onClick={handleSaveOwner}
                    className="bg-blue-600 hover:bg-blue-700 text-white mt-2"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Save Profile
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-300">
                    <span className="font-medium">Email:</span>{" "}
                    {ownerInfo.email}
                  </p>
                  <p className="text-xs text-gray-300">
                    <span className="font-medium">Phone:</span>{" "}
                    {ownerInfo.phone}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2 border-t border-gray-700 pt-4 mt-4">
          {navItems.map(({ icon: Icon, title, id }) => (
            <Button
              key={id}
              variant={activeSection === id ? "secondary" : "ghost"}
              className={`w-full justify-start ${!sidebarOpen && "px-2"} ${
                activeSection === id ? "bg-gray-700" : "hover:bg-gray-700"
              } text-gray-200`}
              onClick={() => setActiveSection(id)}
            >
              <Icon className={`h-5 w-5 ${sidebarOpen && "mr-2"}`} />
              {sidebarOpen && <span>{title}</span>}
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto relative bg-gray-900">
        <div className="relative">
          {activeSection === "overview" && (
            <>
              <Button
                className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowAddPetModal(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Pet
              </Button>
              <AddPetModal
                showAddPetModal={showAddPetModal}
                setShowAddPetModal={setShowAddPetModal}
                handleAddPet={handleAddPet}
              />
            </>
          )}

          {activeSection === "overview" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-100">
                Dashboard Overview
              </h1>

              {/* Tighter grid layout with minimal gap */}
              <div className="flex flex-wrap md:flex-nowrap gap-2">
                {/* Pet Profiles */}
                {pets.map((pet, index) => (
                  <Card
                    key={index}
                    className="max-w-sm p-4 bg-gray-800 text-gray-100"
                  >
                    <CardHeader>
                      <CardTitle className="text-gray-100">
                        Pet Profile
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Your pet's information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-20 w-20 border-4 border-gray-700">
                          <AvatarImage
                            src={pet.petPhoto || "/placeholder.svg"}
                            alt={pet.name || "Pet"}
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                          <AvatarFallback>
                            {pet.name?.[0] || "P"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="text-center">
                          {isEditingPet === index ? (
                            <>
                              <Input
                                name="name"
                                value={pet.name}
                                onChange={(e) => handlePetChange(e, index)}
                                placeholder="Pet Name"
                                className="mt-2 bg-gray-700 text-gray-100"
                              />
                              <Input
                                name="type"
                                value={pet.type}
                                onChange={(e) => handlePetChange(e, index)}
                                placeholder="Pet Type"
                                className="mt-2 bg-gray-700 text-gray-100"
                              />
                              <Input
                                name="age"
                                value={pet.age}
                                onChange={(e) => handlePetChange(e, index)}
                                placeholder="Pet Age"
                                className="mt-2 bg-gray-700 text-gray-100"
                              />
                              <Input
                                name="species"
                                value={pet.species}
                                onChange={(e) => handlePetChange(e, index)}
                                placeholder="Pet Species"
                                className="mt-2 bg-gray-700 text-gray-100"
                              />
                              <Input
                                name="carePlan"
                                value={pet.carePlan}
                                onChange={(e) => handlePetChange(e, index)}
                                placeholder="Care Plan"
                                className="mt-2 bg-gray-700 text-gray-100"
                              />
                            </>
                          ) : (
                            <>
                              <h2 className="text-xl font-semibold text-gray-100">
                                {pet.name || "No Name"}
                              </h2>
                              <Badge
                                variant="outline"
                                className="mt-1 border-gray-600 text-gray-300"
                              >
                                {pet.type || "No Type"}
                              </Badge>
                              <Separator className="bg-gray-700" />
                              <div className="w-full space-y-2">
                                <p className="text-sm text-gray-300">
                                  <span className="font-medium">Age:</span>{" "}
                                  {pet.age}
                                </p>
                                <p className="text-sm text-gray-300">
                                  <span className="font-medium">
                                    Pet Species:
                                  </span>{" "}
                                  {pet.species}
                                </p>
                                <p className="text-sm text-gray-300">
                                  <span className="font-medium">
                                    Care Plan:
                                  </span>
                                  <Badge className="ml-1 bg-gray-700 text-gray-200">
                                    {pet.carePlan}
                                  </Badge>
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-center border-t-2 border-gray-700 space-x-2">
                      {isEditingPet === index ? (
                        <>
                          {/* Save Button when editing */}
                          <Button
                            onClick={() => handleSavePet(index)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Save Pet
                          </Button>
                          <Button
                            onClick={() => setIsEditingPet(null)} // Cancel editing
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          {/* Edit Button when not editing */}
                          <Button
                            onClick={() => handleEditPet(index)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Pet
                          </Button>
                          <Button
                            onClick={() => openNewAppointmentModal(pet)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Appointment
                          </Button>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Conditional rendering of other sections */}
          {activeSection === "appointment" && <Appointment />}
          {activeSection === "notification" && <Notification />}
          {activeSection === "feedback" && <Feedback />}
          {activeSection === "setting" && <Setting />}
        </div>

        {showNewAppointmentModal && (
          <NewAppointmentModal
            isOpen={showNewAppointmentModal}
            onClose={closeNewAppointmentModal}
            pet={selectedPet}
          />
        )}
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
