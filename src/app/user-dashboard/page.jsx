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
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false); // State for appointment modal

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
    } catch (error) {
      console.error("Error adding pet:", error);
    }
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
    } catch (error) {
      console.error("Error updating owner:", error);
    }
  };

  // Pet editing functions
  const handleEditPet = (index) => setIsEditingPet(index);

  const handlePetChange = (e, index) => {
    const { name, value } = e.target;
    setPets((prevPets) =>
      prevPets.map((pet, i) => (i === index ? { ...pet, [name]: value } : pet))
    );
  };

  useEffect(() => {
    // Load pets (adjust this to your needs)
    const loadPets = async () => {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.petCollectionId
        );
        setPets(response.documents || []);
      } catch (error) {
        console.error("Error loading pets:", error);
      }
    };
    loadPets();
  }, []);

 const openNewAppointmentModal = (pet) => {
    setSelectedPet(pet); // Set the pet details for the new appointment
    setShowNewAppointmentModal(true); // Show the appointment modal
  };

  const closeNewAppointmentModal = () => {
    setShowNewAppointmentModal(false); // Hide the appointment modal
    setSelectedPet(null); // Clear the selected pet details
  };

  useEffect(() => {
    const loadPets = async () => {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.petCollectionId
        );
        setPets(response.documents || []);
      } catch (error) {
        console.error("Error loading pets:", error);
      }
    };
    loadPets();
  }, []);


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
    { icon: Home, title: "Overview", id: "overview" },
    { icon: CalendarIcon, title: "Appointments", id: "appointment" },
    { icon: NotificationIcon, title: "Notifications", id: "notification" },
    { icon: FeedbackIcon, title: "Feedback", id: "feedback" },
    { icon: SettingsIcon, title: "Settings", id: "setting" },
  ];

  const PawPrintLoader = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-100 to-green-100">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-primary rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <PawPrint className="w-12 h-12 text-primary animate-bounce" />
        </div>
      </div>
      <p className="mt-4 text-lg font-medium text-primary animate-pulse">
        Loading your pet paradise...
      </p>
    </div>
  );

  if (loading) {
    return <PawPrintLoader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-white ${
          sidebarOpen ? "w-64" : "w-20"
        } min-h-screen p-4 flex flex-col relative transition-all`}
      >
        <Button
          variant="outline"
          className={`absolute top-4 right-4 transition-all ${
            sidebarOpen ? "mr-2" : "ml-0"
          }`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>

        <div className="flex flex-col items-center mt-16 space-y-2">
          <Avatar className="h-20 w-20">
            <AvatarImage src={ownerInfo.avatarUrl} alt="User" />
            <AvatarFallback>{ownerInfo.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          {sidebarOpen && (
            <div className="text-center">
              <p className="text-sm font-medium">{ownerInfo.name || "Guest"}</p>
              <p className="text-xs text-gray-500">Pet Parent</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2 border-t pt-4">
          {navItems.map(({ icon: Icon, title, id }) => (
            <Button
              key={id}
              variant={activeSection === id ? "secondary" : "ghost"}
              className={`w-full justify-start ${!sidebarOpen && "px-2"}`}
              onClick={() => setActiveSection(id)}
            >
              <Icon className={`h-5 w-5 ${sidebarOpen && "mr-2"}`} />
              {sidebarOpen && <span>{title}</span>}
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto relative">
        <div className="relative">
          {activeSection === "overview" && (
            <>
              <Button
                className="absolute top-4 right-4"
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
              <h1 className="text-3xl font-bold text-gray-800">
                Dashboard Overview
              </h1>

              {/* Tighter grid layout with minimal gap */}
              <div className="flex flex-wrap md:flex-nowrap gap-2">
                {/* Owner Profile */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-sm p-4">
                  <CardHeader className="pb-2 border-b-2">
                    <CardTitle className="text-xl text-black">
                      Owner Profile
                    </CardTitle>
                    <CardDescription>Your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex flex-col items-center space-y-4">
                      <Avatar className="h-20 w-20 border-4 border-primary/20">
                        <AvatarImage
                          src={ownerInfo.avatarUrl || "/placeholder.svg"}
                          alt={ownerInfo.name || "User"}
                        />
                        <AvatarFallback>
                          {ownerInfo.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="text-center">
                        {isEditingOwner ? (
                          <>
                            <Input
                              name="name"
                              value={ownerInfo.name}
                              onChange={handleOwnerChange}
                              placeholder="Name"
                              className="mt-2"
                            />
                            <Input
                              name="email"
                              value={ownerInfo.email}
                              onChange={handleOwnerChange}
                              placeholder="Email"
                              className="mt-2"
                            />
                            <Input
                              name="phone"
                              value={ownerInfo.phone}
                              onChange={handleOwnerChange}
                              placeholder="Phone"
                              className="mt-2"
                            />
                          </>
                        ) : (
                          <>
                            <h2 className="text-xl font-semibold text-black">
                              {ownerInfo.name || "No Name"}
                            </h2>
                            <Badge variant="secondary" className="mt-1">
                              Pet Parent
                            </Badge>
                            <Separator className="bg-black" />
                            <div className="w-full space-y-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Email:</span>{" "}
                                {ownerInfo.email}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Phone:</span>{" "}
                                {ownerInfo.phone}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-center border-t-2">
                    <Button
                      onClick={
                        isEditingOwner ? handleSaveOwner : toggleEditOwner
                      }
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {isEditingOwner ? "Save Profile" : "Edit Profile"}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Pet Profiles */}
                {pets.map((pet, index) => (
                  <Card key={index} className="max-w-sm p-4">
                    <CardHeader>
                      <CardTitle>Pet Profile</CardTitle>
                      <CardDescription>Your pet's information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-20 w-20 border-4 border-secondary/20">
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
                                className="mt-2"
                              />
                              <Input
                                name="type"
                                value={pet.type}
                                onChange={(e) => handlePetChange(e, index)}
                                placeholder="Pet Type"
                                className="mt-2"
                              />
                              <Input
                                name="age"
                                value={pet.age}
                                onChange={(e) => handlePetChange(e, index)}
                                placeholder="Pet Age"
                                className="mt-2"
                              />
                              <Input
                                name="species"
                                value={pet.species}
                                onChange={(e) => handlePetChange(e, index)}
                                placeholder="Pet Species"
                                className="mt-2"
                              />
                              <Input
                                name="carePlan"
                                value={pet.carePlan}
                                onChange={(e) => handlePetChange(e, index)}
                                placeholder="Care Plan"
                                className="mt-2"
                              />
                            </>
                          ) : (
                            <>
                              <h2 className="text-xl font-semibold text-black">
                                {pet.name || "No Name"}
                              </h2>
                              <Badge variant="outline" className="mt-1">
                                {pet.type || "No Type"}
                              </Badge>
                              <Separator className="bg-black" />
                              <div className="w-full space-y-2">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Age:</span>{" "}
                                  {pet.age}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">
                                  Pet Species:
                                  </span>{" "}
                                  {pet.species}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">
                                    Care Plan:
                                  </span>
                                  <Badge>{pet.carePlan}</Badge>
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-center border-t-2 space-x-2">
                      <Button onClick={() => handleEditPet(index)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Pet
                      </Button>
                      <Button onClick={() => openNewAppointmentModal(pet)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Appointment
                      </Button>
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
            pet={selectedPet} // Pass the selected pet details to the modal
          />
        )}
      </main>
    </div>
  );
}
