"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  PlusCircle,
  Edit,
  Trash2,
  Check,
  Pencil,
  Clock,
  X,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "react-toastify";
import { appwriteConfig } from "@/lib/appwrite";
import AddPetModal from "../modals/AddPetsModal";
import NewAppointmentModal from "../modals/newAppointmentModal";
import { ID } from "appwrite";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MyPets({ pets, setPets, databases, storage }) {
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [isEditingPet, setIsEditingPet] = useState(null);
  const [selectedPets, setSelectedPets] = useState([]);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const handleAddPet = async (newPet) => {
    try {
      const petPhotoUrl = newPet?.petPhotoId
        ? `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.bucketId}/files/${newPet.petPhotoId}/view?project=${appwriteConfig.projectId}`
        : "/placeholder.svg";

      setPets((prevPets) => [
        ...prevPets,
        {
          $id: ID.unique(),
          petName: newPet?.petName || "No Name",
          petType: newPet?.petType || "No Type",
          petAge: newPet?.petAge || "No Age",
          petSpecies: newPet?.petSpecies || "None",
          petServices: newPet?.petServices || "No Plan",
          petPhotoId: petPhotoUrl,
        },
      ]);
      toast.success("Pet added successfully!");
    } catch (error) {
      console.error("Error adding pet:", error);
      toast.error("Failed to add pet");
    }
  };

  const handleEditPet = (index) => setIsEditingPet(index);

  const handlePetChange = (e, index) => {
    const { name, value } = e.target;
    setPets((prevPets) =>
      prevPets.map((pet, i) => {
        if (i === index) {
          return {
            ...pet,
            [name === "name"
              ? "petName"
              : name === "age"
              ? "petAge"
              : name === "species"
              ? "petSpecies"
              : name]: value,
          };
        }
        return pet;
      })
    );
  };

  const handleSavePet = async (index) => {
    try {
      const pet = pets[index];
      if (!pet.$id) {
        throw new Error("Missing document ID for the pet.");
      }

      const updatedData = {
        petName: pet.petName,
        petAge: pet.petAge,
        petSpecies: pet.petSpecies,
      };

      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId,
        pet.$id,
        updatedData
      );

      setPets((prevPets) =>
        prevPets.map((p, i) => (i === index ? { ...p, ...updatedData } : p))
      );

      setIsEditingPet(null);
      toast.success("Pet details saved successfully!");
    } catch (error) {
      console.error("Error saving pet details:", error);
      toast.error("Failed to save pet details. Please try again.");
    }
  };

  const handleDeletePet = async (petId, petName) => {
    if (window.confirm(`Are you sure you want to delete ${petName}?`)) {
      try {
        await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.petCollectionId,
          petId
        );

        setPets((prevPets) => prevPets.filter((pet) => pet.$id !== petId));
        setSelectedPets((prevSelected) =>
          prevSelected.filter((id) => id !== petId)
        );
        toast.success(`${petName} has been deleted successfully`);
      } catch (error) {
        console.error("Error deleting pet:", error);
        toast.error("Failed to delete pet");
      }
    }
  };

  const handlePetPhotoChange = async (e, petId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await storage.createFile(
        appwriteConfig.bucketId,
        ID.unique(),
        file
      );

      const photoUrl = `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.bucketId}/files/${response.$id}/view?project=${appwriteConfig.projectId}`;

      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId,
        petId,
        {
          petPhotoId: photoUrl,
        }
      );

      setPets((prevPets) =>
        prevPets.map((pet) =>
          pet.$id === petId ? { ...pet, petPhotoId: photoUrl } : pet
        )
      );

      toast.success("Pet photo updated successfully!");
    } catch (error) {
      console.error("Error updating pet photo:", error);
      toast.error("Failed to update pet photo");
    }
  };

  const handleSelectPet = (petId) => {
    setSelectedPets((prevSelected) => {
      if (prevSelected.includes(petId)) {
        return prevSelected.filter((id) => id !== petId);
      } else {
        return [...prevSelected, petId];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedPets(pets.map((pet) => pet.$id));
    } else {
      setSelectedPets([]);
    }
  };

  const openNewAppointmentModal = () => {
    if (selectedPets.length === 0) {
      toast.error("Please select at least one pet for appointment");
      return;
    }
    setShowNewAppointmentModal(true);
  };

  return (
    <div className="space-y-4 p-4 md:p-6 max-w-[1800px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#2D2C2E]">
          Dashboard Overview
        </h1>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            className="bg-[#FBBD0D] hover:bg-[#FBBD0D]/90 text-[#2D2C2E] font-medium px-3 h-9 rounded-lg flex-1 sm:flex-none"
            onClick={() => setShowAddPetModal(true)}
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            Add Pets
          </Button>
          <Button
            className="bg-[#FD1F4A] hover:bg-[#FD1F4A]/90 text-white font-medium px-3 h-9 rounded-lg flex-1 sm:flex-none"
            onClick={openNewAppointmentModal}
            disabled={selectedPets.length === 0}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Schedule
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id="selectAll"
          checked={selectAll}
          onCheckedChange={handleSelectAll}
          className="border-[#FBBD0D] text-[#2D2C2E]"
        />
        <label
          htmlFor="selectAll"
          className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#2D2C2E]"
        >
          Select All Pets
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 justify-items-center">
        {pets.map((pet, index) => (
          <motion.div
            key={pet.$id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="w-full flex justify-center"
          >
            <Card className="[#FBBD0D]/20 border-[#FBBD0D]/50 shadow hover:shadow-md transition-all hover:border-[#FD1F4A]/50 hover:bg-gradient-to-b hover:from-white hover:to-[#FAF5E6] min-h-[280px] sm:min-h-[300px] w-[300px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 sm:p-3">
                <CardTitle className="text-sm sm:text-base font-semibold text-[#2D2C2E] w-[120px]">
                  Pet Profile
                </CardTitle>
                <Checkbox
                  checked={selectedPets.includes(pet.$id)}
                  onCheckedChange={() => handleSelectPet(pet.$id)}
                  className="border-[#FBBD0D] text-[#2D2C2E] h-3 w-3 sm:h-4 sm:w-4"
                />
              </CardHeader>
              <CardContent className="p-2 sm:p-3">
                <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                  <div className="relative">
                    <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-[#FBBD0D]">
                      <AvatarImage
                        src={pet.petPhotoId || "/placeholder.svg"}
                        alt={pet.petName || "Pet"}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      <AvatarFallback className="bg-[#FBBD0D] text-[#2D2C2E]">
                        {pet.petName?.[0] || "P"}
                      </AvatarFallback>
                    </Avatar>
                    {isEditingPet === index && (
                      <div className="absolute bottom-0 right-0">
                        <label
                          htmlFor={`pet-photo-${pet.$id}`}
                          className="cursor-pointer"
                        >
                          <div className="rounded-full bg-[#FD1F4A] p-1 hover:bg-[#FD1F4A]/90">
                            <Edit className="h-3 w-3 text-white" />
                          </div>
                          <Input
                            type="file"
                            id={`pet-photo-${pet.$id}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePetPhotoChange(e, pet.$id)}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="text-center w-full space-y-1 sm:space-y-2">
                    {isEditingPet === index ? (
                      <div className="space-y-1 sm:space-y-2">
                        <Input
                          name="name"
                          value={pet.petName || ""}
                          onChange={(e) => handlePetChange(e, index)}
                          placeholder="Pet Name"
                          className="border-[#FBBD0D] focus:ring-1 focus:ring-[#FD1F4A] focus:border-transparent text-xs sm:text-sm h-6 sm:h-8"
                        />
                        <Input
                          name="age"
                          value={pet.petAge || ""}
                          onChange={(e) => handlePetChange(e, index)}
                          placeholder="Pet Age"
                          className="border-[#FBBD0D] focus:ring-1 focus:ring-[#FD1F4A] focus:border-transparent text-xs sm:text-sm h-6 sm:h-8"
                        />
                        <Input
                          name="species"
                          value={pet.petSpecies || ""}
                          onChange={(e) => handlePetChange(e, index)}
                          placeholder="Pet Species"
                          className="border-[#FBBD0D] focus:ring-1 focus:ring-[#FD1F4A] focus:border-transparent text-xs sm:text-sm h-6 sm:h-8"
                        />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-sm sm:text-base font-semibold text-[#2D2C2E]">
                          {pet.petName || "No Name"}
                        </h2>
                        <Badge
                          variant="outline"
                          className="mt-1 bg-[#FBBD0D]/10 text-[#2D2C2E] border-[#FBBD0D] text-xs px-1.5 py-0.5"
                        >
                          {pet.petType || "No Type"}
                        </Badge>
                        <Separator className="my-1 sm:my-2 bg-[#FBBD0D]/20" />
                        <div className="space-y-1 sm:space-y-2 text-center">
                          <div className="text-left space-y-0.5 sm:space-y-1">
                            <p className="text-xs sm:text-sm">
                              <span className="text-[#2D2C2E] font-semibold">
                                Age:
                              </span>{" "}
                              {pet.petAge}
                            </p>
                            <p className="text-xs sm:text-sm">
                              <span className="text-[#2D2C2E] font-semibold">
                                Species:
                              </span>{" "}
                              {pet.petSpecies}
                            </p>
                          </div>

                          <div className="flex justify-center items-center w-full">
                            <Badge
                              className={`
                                ${
                                  pet.status === "Done" ||
                                  pet.status?.[0] === "Done"
                                    ? "bg-green-500 text-white hover:bg-green-600 border-green-600 flex items-center gap-2"
                                    : pet.status === "Accepted" ||
                                      pet.status?.[0] === "Accepted"
                                    ? "bg-green-500 text-white hover:bg-green-600 border-green-600"
                                    : pet.status === "Pending" ||
                                      pet.status?.[0] === "Pending"
                                    ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-600 flex items-center gap-2"
                                    : pet.status === "Declined" ||
                                      pet.status?.[0] === "Declined"
                                    ? "bg-red-900 text-white hover:bg-red-600 border-red-600 flex items-center gap-2"
                                    : "bg-gray-500 text-white hover:bg-gray-600 border-gray-600"
                                }
                                transition-colors duration-200 border px-2 py-0.5 rounded-full text-xs font-medium
                                flex items-center justify-center gap-1 min-w-[100px]
                              `}
                            >
                              <span className="text-xs">
                                {Array.isArray(pet.petServices)
                                  ? pet.petServices[0]
                                  : pet.petServices}
                              </span>
                              <span className="text-xs">•</span>
                              <span className="font-semibold text-xs flex items-center gap-0.5">
                                {Array.isArray(pet.status)
                                  ? pet.status[0]
                                  : pet.status}
                                {(pet.status === "Done" ||
                                  pet.status?.[0] === "Done") && (
                                  <Check className="w-3 h-3" />
                                )}
                                {(pet.status === "Pending" ||
                                  pet.status?.[0] === "Pending") && (
                                  <Clock className="w-3 h-3" />
                                )}
                                {(pet.status === "Declined" ||
                                  pet.status?.[0] === "Declined") && (
                                  <X className="w-3 h-3" />
                                )}
                              </span>
                            </Badge>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-center border-t border-[#FBBD0D]/20 space-x-1 sm:space-x-2 p-2 sm:p-3">
                {isEditingPet === index ? (
                  <>
                    <Button
                      onClick={() => handleSavePet(index)}
                      className="bg-[#FD1F4A] hover:bg-[#FD1F4A]/90 text-white font-medium text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1"
                    >
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingPet(null)}
                      className="border-[#FBBD0D] hover:bg-[#FBBD0D]/10 text-[#2D2C2E] text-xs px-2 py-0.5"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => handleEditPet(index)}
                      className="bg-[#FBBD0D] hover:bg-[#FBBD0D]/90 text-[#2D2C2E] font-medium text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1"
                    >
                      <Pencil className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeletePet(pet.$id, pet.petName)}
                      className="bg-[#FD1F4A] hover:bg-[#FD1F4A]/90 text-white font-medium text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <AddPetModal
        showAddPetModal={showAddPetModal}
        setShowAddPetModal={setShowAddPetModal}
        handleAddPet={handleAddPet}
      />

      {showNewAppointmentModal && (
        <NewAppointmentModal
          isOpen={showNewAppointmentModal}
          onClose={() => setShowNewAppointmentModal(false)}
          pets={pets.filter((pet) => selectedPets.includes(pet.$id))}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        closeOnClick
      />
    </div>
  );
}
