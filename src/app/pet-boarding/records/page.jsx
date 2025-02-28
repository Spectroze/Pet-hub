"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { toast } from "react-toastify";
import { databases, appwriteConfig, account } from "../../../lib/appwrite";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Query } from "appwrite";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from 'next/image';
import { PawPrint } from "lucide-react";

export default function Pets() {
  const [petRecords, setPetRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [petAppointments, setPetAppointments] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [visibleRecords, setVisibleRecords] = useState(3);
  const [visibleAppointments, setVisibleAppointments] = useState(3);
  const [petInfo, setPetInfo] = useState({});

  useEffect(() => {
    const fetchUserRoleAndPets = async () => {
      try {
        const user = await account.get();
        let role = "";

        if (user.prefs && user.prefs.role) {
          role = user.prefs.role;
        } else {
          try {
            const response = await databases.listDocuments(
              appwriteConfig.databaseId,
              appwriteConfig.userCollectionId,
              [Query.equal("accountId", user.$id)]
            );

            if (response.documents.length > 0) {
              role = response.documents[0].role || "";
            }
          } catch (docError) {
            console.warn(
              "Could not fetch user role from collection:",
              docError
            );
          }
        }

        role = role.toLowerCase().trim();
        setUserRole(role);

        if (!role) {
          toast.error("Invalid or missing user role. Please contact support.");
          return;
        }

        const clinicMatch = role.match(/clinic\s*(\d+)/i);
        if (!clinicMatch) {
          toast.error("Invalid clinic role format");
          return;
        }

        const clinicNumber = parseInt(clinicMatch[1]);
        if (isNaN(clinicNumber) || clinicNumber < 1 || clinicNumber > 10) {
          toast.error("Invalid clinic number. Must be between 1 and 10.");
          return;
        }

        await fetchPetRecords(role);
      } catch (error) {
        console.error("Error fetching user role:", error);
        toast.error("Failed to fetch user data");
      }
    };

    fetchUserRoleAndPets();
  }, []);

  const fetchPetRecords = async (role) => {
    setIsLoading(true);
    setPetRecords([]);
    try {
      const clinicMatch = role.match(/clinic\s*(\d+)/i);
      const clinicNumber = clinicMatch ? clinicMatch[1] : null;

      if (
        !clinicNumber ||
        isNaN(clinicNumber) ||
        clinicNumber < 1 ||
        clinicNumber > 10
      ) {
        toast.error("Invalid clinic number. Must be between 1 and 10.");
        setIsLoading(false);
        return;
      }

      const petsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId,
        [
          Query.equal("petClinic", `Clinic ${clinicNumber}`),
          Query.equal("status", "Done"),
        ]
      );

      if (petsResponse.documents.length === 0) {
        toast.info(
          `No completed appointments found for Clinic ${clinicNumber}`
        );
        setIsLoading(false);
        return;
      }

      const ownerIds = [
        ...new Set(petsResponse.documents.map((pet) => pet.ownerId)),
      ];

      const ownersResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("accountId", ownerIds)]
      );

      const ownersMap = ownersResponse.documents.reduce((acc, owner) => {
        acc[owner.accountId] = owner;
        return acc;
      }, {});

      const groupedPets = petsResponse.documents.reduce((acc, pet) => {
        const petId = pet.$id;
        const ownerId = pet.ownerId;
        const owner = ownersMap[ownerId];
        const petPhotoId = pet.petPhotoId || "default-photo-id";

        if (!acc[petPhotoId] && owner) {
          acc[petPhotoId] = {
            id: petId,
            name: pet.petName,
            species: pet.petSpecies,
            age: pet.petAge || "Unknown Age",
            photo: pet.petPhotoId || "https://placekitten.com/200/300",
            appointments: [],
            clinic: pet.petClinic,
            status: pet.status,
            owner: {
              name: owner.name || "Unknown Owner",
              email: owner.email || "No Email",
              phone: owner.phone || "No Phone",
            },
          };
        }

        if (acc[petPhotoId]) {
          acc[petPhotoId].appointments.push({
            date: pet.petDate || "No Date",
            service: pet.petServices || "No Service",
            doneNotes: pet.doneNotes || "No notes available",
            status: pet.status,
          });
        }

        return acc;
      }, {});

      const petsArray = Object.values(groupedPets);
      petsArray.sort((a, b) => {
        const aDate = new Date(a.appointments[0]?.date || 0);
        const bDate = new Date(b.appointments[0]?.date || 0);
        return bDate - aDate;
      });

      setPetRecords(petsArray);
    } catch (error) {
      console.error("Error fetching pet records:", error.message);
      toast.error(`Failed to fetch pet records`);
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
    setVisibleAppointments(3);
  };

  const filteredRecords = petRecords.filter((record) =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deletePet = async (petId) => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId,
        petId
      );
      toast.success("Pet deleted successfully");
      fetchPetRecords(userRole);
    } catch (error) {
      console.error("Error deleting pet:", error);
      toast.error("Failed to delete pet");
    }
  };

  const loadMoreRecords = () => {
    setVisibleRecords((prev) => prev + 3);
  };

  const loadMoreAppointments = () => {
    setVisibleAppointments((prev) => prev + 3);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
  };

  return (
    <div className="min-h-screen bg-[#FAF5E6] p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-[#2D2C2E] mb-2">
              Clinic Pets Record
              <div className="h-1 w-36 bg-[#FBBDOD] mt-2" />
            </h1>
            <p className="text-base text-gray-600 mt-2">
              Manage the pets record of your clinic
            </p>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search pet name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-white border-gray-200 rounded-lg focus:border-[#FBBD0D] focus:ring-[#FBBD0D]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">Loading pet records...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredRecords.slice(0, visibleRecords).map((record) => (
              <Card
                key={record.id}
                className="overflow-hidden border-[#FBBDOD] hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-40 relative">
                  <Image
                    src={record.photo}
                    alt={record.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="text-2xl font-bold text-center mb-4">
                    {record.name}
                  </h3>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Species:</span>
                      <span className="font-medium">{record.species}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{record.age}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-[#FD1F4A] hover:bg-[#FD1F4A]/90 text-white text-lg py-3"
                    onClick={() => openPetModal(record)}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredRecords.length > visibleRecords && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={loadMoreRecords}
              variant="outline"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Load More ({filteredRecords.length - visibleRecords} remaining)
            </Button>
          </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-sm bg-[#FAF5E6] p-4">
            {selectedPet && (
              <>
                <DialogHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <DialogTitle className="text-lg font-bold">
                      {selectedPet.name}&apos;s Profile
                    </DialogTitle>
                  </div>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <Image
                      src={selectedPet.photo}
                      alt={selectedPet.name}
                      width={200}
                      height={200}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Name</label>
                      <p className="text-base font-medium">
                        {selectedPet.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Age</label>
                      <p className="text-base font-medium">{selectedPet.age}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Species</label>
                      <p className="text-base font-medium">
                        {selectedPet.species}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-semibold mb-3">
                    Appointment History
                  </h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {petAppointments
                      .slice(0, visibleAppointments)
                      .map((appointment, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 shadow-sm"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">
                              {appointment.formattedDate}
                            </span>
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs">
                              {appointment.service}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Notes:</p>
                            <p className="text-sm mt-1">
                              {appointment.doneNotes}
                            </p>
                          </div>
                        </div>
                      ))}

                    {petAppointments.length > visibleAppointments && (
                      <div className="text-center mt-3">
                        <Button
                          variant="outline"
                          onClick={loadMoreAppointments}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          View {petAppointments.length - visibleAppointments}{" "}
                          More
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
