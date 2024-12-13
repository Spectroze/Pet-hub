"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { databases, appwriteConfig } from "../../../lib/appwrite";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function Pets() {
  const [petRecords, setPetRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [petAppointments, setPetAppointments] = useState([]);

  // Fetch and group pet records
  // Fetch and group pet records
  const fetchPetRecords = async () => {
    setIsLoading(true);
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId
      );

      // Filter records to include only those with status array containing 'Accepted'
      const filteredPets = response.documents.filter(
        (pet) => Array.isArray(pet.status) && pet.status.includes("Accepted")
      );

      // Group pets by petPhotoId and merge their services
      const groupedPets = filteredPets.reduce((acc, pet) => {
        // Ensure the pet service is valid
        const service = pet.petServices
          ? String(pet.petServices).trim().toLowerCase()
          : "";

        if (service === "pet training") {
          const petId = pet.$id;
          const petPhotoId = pet.petPhotoId || "default-photo-id"; // Default in case of no photo

          // Initialize pet entry if it doesn't exist
          if (!acc[petPhotoId]) {
            acc[petPhotoId] = {
              id: petId,
              name: pet.petName,
              species: pet.petSpecies,
              age: pet.petAge || "Unknown Age",
              photo: pet.petPhotoId || "https://placekitten.com/200/300", // Default image if missing
              appointments: [],
            };
          }

          // Add the valid service if it's a new one for this pet
          acc[petPhotoId].appointments.push({
            date: pet.petDate || "No Date",
            service: pet.petServices || "No Service",
          });
        }

        return acc;
      }, {});

      // Convert grouped pets into an array and set state
      setPetRecords(Object.values(groupedPets));
    } catch (error) {
      console.error("Error fetching pet records:", error.message);
      toast.error("Failed to fetch pet records.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoDateString) => {
    try {
      const date = new Date(isoDateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return isoDateString;
    }
  };

  const openPetModal = (pet) => {
    setSelectedPet(pet);
    setPetAppointments(
      pet.appointments.map((appointment) => ({
        ...appointment,
        formattedDate: formatDate(appointment.date),
      }))
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPet(null);
    setPetAppointments([]);
  };

  const deletePet = async (petId) => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId,
        petId
      );
      toast.success("Pet deleted successfully");
      fetchPetRecords(); // Refresh the pet list
    } catch (error) {
      console.error("Error deleting pet:", error);
      toast.error("Failed to delete pet");
    }
  };

  useEffect(() => {
    fetchPetRecords();
  }, []);

  const filteredRecords = petRecords.filter((record) =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-4xl font-bold flex items-center gap-3 text-[#FF6B6B]">
          <PlusCircle className="h-10 w-10 text-[#FF6B6B]" />
          Pet Records
        </h2>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Search className="h-5 w-5 text-white" />
          <Input
            placeholder="Search pet records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-gray-800 border-gray-700 focus:border-[#FF6B6B] focus:ring-[#FF6B6B] text-white"
          />
        </div>
      </div>
      {isLoading ? (
        <div className="text-center py-12 text-[#FF6B6B] bg-gray-800 rounded-lg shadow-xl">
          <p className="text-xl font-semibold">Loading pet records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <Card
              key={record.id}
              className="bg-gray-800 border-gray-700 overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 relative"
            >
              <div
                onClick={() => openPetModal(record)}
                className="cursor-pointer"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={record.photo}
                      alt={record.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-4">
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {record.species}
                      </h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-lg">Pet Name:</span>
                      <span className="text-[#FF6B6B] font-bold text-xl">
                        {record.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-lg">Age:</span>
                      <span className="text-white font-semibold bg-gray-700 px-3 rounded-full">
                        {record.age}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-400 text-lg">Services:</span>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {record.appointments.map((appointment, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-[#FF6B6B] text-white hover:bg-[#FF8C8C]"
                          >
                            {appointment.service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
              <div className="absolute top-2 right-2">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePet(record.id);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {filteredRecords.length === 0 && !isLoading && (
        <div className="text-center py-12 text-[#FF6B6B] bg-gray-800 rounded-lg shadow-xl">
          <PlusCircle className="h-16 w-16 mx-auto mb-4 text-[#FF6B6B]" />
          <p className="text-2xl font-bold mb-2">No pet records found.</p>
          <p className="text-lg text-gray-400">
            Try adjusting your search or add a new pet record.
          </p>
        </div>
      )}

      {isModalOpen && selectedPet && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-[#FF6B6B]">
                {selectedPet.name}'s Details
              </h2>
              <XCircle
                className="h-8 w-8 text-gray-400 cursor-pointer hover:text-gray-300"
                onClick={closeModal}
              />
            </div>
            <div className="space-y-4">
              <img
                src={selectedPet.photo}
                alt={selectedPet.name}
                className="w-full h-64 object-cover rounded-md"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-400">
                  Appointments:
                </h3>
                <div className="space-y-2 mt-2">
                  {petAppointments.map((appointment, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-white"
                    >
                      <span className="font-semibold">
                        {appointment.formattedDate}
                      </span>
                      <Badge variant="outline" className="text-[#FF6B6B]">
                        {appointment.service}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
