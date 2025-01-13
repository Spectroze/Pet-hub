"use client";

import { useEffect, useState } from "react";
import { databases, appwriteConfig, account } from "../../../lib/appwrite";
import { Query } from "appwrite";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, X } from "lucide-react";
import { format, parse } from "date-fns";

export default function Pets() {
  const [petRecords, setPetRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);

  useEffect(() => {
    const fetchUserAndPets = async () => {
      setIsLoading(true);
      try {
        const user = await account.get();
        const userResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          [Query.equal("accountId", user.$id)]
        );

        if (userResponse.documents.length === 0) {
          toast.error("User not found in database");
          return;
        }

        const petsResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.petCollectionId,
          [Query.equal("ownerId", user.$id)]
        );

        // Group pets and include their notes
        const groupedPets = petsResponse.documents.reduce((acc, pet) => {
          // Debug log to see the raw pet data
          console.log("Raw pet data:", {
            name: pet.petName,
            date: pet.petDate,
            time: pet.petTime,
            notes: pet.doneNotes,
            services: pet.petServices,
          });

          if (!acc[pet.petName]) {
            acc[pet.petName] = {
              ...pet,
              allServices: [],
            };
          }

          if (pet.petServices || pet.petDate || pet.doneNotes) {
            // Convert and format date (e.g., "January 25, 2024")
            const formattedDate = pet.petDate
              ? format(new Date(pet.petDate), "MMMM dd, yyyy")
              : "No date";

            // Convert military time to 12-hour format with AM/PM
            let formattedTime = "No time";
            if (pet.petTime) {
              try {
                const timeDate = parse(pet.petTime, "HH:mm", new Date());
                formattedTime = format(timeDate, "h:mm aa"); // e.g., "2:30 PM"
              } catch (error) {
                console.log("Error formatting time:", error);
                formattedTime = pet.petTime;
              }
            }

            const serviceEntry = {
              date: formattedDate,
              time: formattedTime,
              notes: pet.doneNotes || "No notes",
              service: pet.petServices || "Unknown service",
            };

            // Debug log for service entry
            console.log("Adding service entry:", serviceEntry);

            acc[pet.petName].allServices.push(serviceEntry);
          }

          return acc;
        }, {});

        setPetRecords(Object.values(groupedPets));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndPets();
  }, []);

  const handleViewDetails = (pet) => {
    setSelectedPet(pet);
    setShowModal(true);
  };

  return (
    <div className="container mx-auto px-4 bg-[#FAF5E6] min-h-screen">
      <header className="pt-6 sm:pt-8 pb-6 sm:pb-10 text-center relative">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2C2E] mb-2 relative inline-block">
            My Pets Record
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#FBBD0D] rounded-full"></span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-[#2D2C2E]/70 mt-3">
            Manage your pet profiles and service history
          </p>
        </div>
        <div className="absolute top-4 sm:top-6 left-0 w-full">
          <div className="absolute left-4 sm:left-8 opacity-10">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#FBBD0D]"
            >
              <path
                d="M4.5 9.5C5.88071 9.5 7 8.38071 7 7C7 5.61929 5.88071 4.5 4.5 4.5C3.11929 4.5 2 5.61929 2 7C2 8.38071 3.11929 9.5 4.5 9.5Z"
                fill="currentColor"
              />
              <path
                d="M19.5 9.5C20.8807 9.5 22 8.38071 22 7C22 5.61929 20.8807 4.5 19.5 4.5C18.1193 4.5 17 5.61929 17 7C17 8.38071 18.1193 9.5 19.5 9.5Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="absolute right-4 sm:right-8 opacity-10">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#FBBD0D]"
            >
              <path
                d="M7.5 19.5C8.88071 19.5 10 18.3807 10 17C10 15.6193 8.88071 14.5 7.5 14.5C6.11929 14.5 5 15.6193 5 17C5 18.3807 6.11929 19.5 7.5 19.5Z"
                fill="currentColor"
              />
              <path
                d="M16.5 19.5C17.8807 19.5 19 18.3807 19 17C19 15.6193 17.8807 14.5 16.5 14.5C15.1193 14.5 14 15.6193 14 17C14 18.3807 15.1193 19.5 16.5 19.5Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 sm:h-64">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#FD1F4A]"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {petRecords.length === 0 ? (
              <div className="col-span-full text-center py-6">
                <p className="text-[#2D2C2E]">No pets found</p>
              </div>
            ) : (
              petRecords.map((pet) => (
                <Card
                  key={pet.$id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-[#FBBD0D]"
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={pet.petPhotoId || "/placeholder.svg"}
                        alt={pet.petName}
                        className="w-full h-32 sm:h-36 object-cover"
                      />
                    </div>

                    <div className="p-2 text-center bg-white border-b border-[#2D2C2E]/10">
                      <h3 className="text-lg sm:text-xl font-bold text-[#2D2C2E]">
                        {pet.petName}
                      </h3>
                    </div>

                    <div className="p-2 sm:p-3 space-y-1.5 bg-white">
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-[#2D2C2E]">Breed:</span>
                        <span className="font-medium text-[#2D2C2E]">
                          {pet.petSpecies}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-[#2D2C2E]">Age:</span>
                        <span className="font-medium text-[#2D2C2E]">
                          {pet.petAge} years
                        </span>
                      </div>
                      <Button
                        className="w-full bg-[#FD1F4A] hover:bg-[#FD1F4A]/90 text-[#FAF5E6] text-sm sm:text-base"
                        onClick={() => handleViewDetails(pet)}
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <AnimatePresence>
            {showModal && selectedPet && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#FAF5E6] rounded-lg shadow-xl w-full max-w-[80%] sm:max-w-sm mx-auto overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative p-2 border-b border-[#2D2C2E]/10">
                    <h2 className="text-lg font-bold text-[#2D2C2E] pl-1">
                      {selectedPet.petName}'s Profile
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="absolute top-2 right-2 text-[#2D2C2E]/60 hover:text-[#2D2C2E] transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-2 grid grid-cols-2 gap-2">
                    <div className="col-span-2 sm:col-span-1">
                      <img
                        src={selectedPet.petPhotoId || "/placeholder.svg"}
                        alt={selectedPet.petName}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 space-y-2">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <p className="text-[#2D2C2E]/60 text-xs mb-0.5">Name</p>
                        <p className="text-[#2D2C2E] text-sm font-medium">
                          {selectedPet.petName}
                        </p>
                      </div>

                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <p className="text-[#2D2C2E]/60 text-xs mb-0.5">Age</p>
                        <p className="text-[#2D2C2E] text-sm font-medium">
                          {selectedPet.petAge} Months
                        </p>
                      </div>

                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <p className="text-[#2D2C2E]/60 text-xs mb-0.5">
                          Breed
                        </p>
                        <p className="text-[#2D2C2E] text-sm font-medium">
                          {selectedPet.petSpecies}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 border-t border-[#2D2C2E]/10">
                    <h3 className="text-base font-semibold text-[#2D2C2E] mb-2">
                      Appointment History
                    </h3>

                    <div className={showAllServices ? "h-[200px]" : ""}>
                      <ScrollArea
                        className={showAllServices ? "h-full pr-2" : "pr-2"}
                      >
                        <div className="space-y-2">
                          {(showAllServices
                            ? selectedPet.allServices
                            : selectedPet.allServices?.slice(0, 3)
                          )?.map((serviceInfo, index) => (
                            <div
                              key={index}
                              className="bg-white p-2 rounded-lg shadow-sm"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-[#2D2C2E] text-xs font-medium">
                                    Date: {serviceInfo.date}
                                  </p>
                                </div>
                                <Badge className="bg-green-500 text-[#2D2C2E] hover:bg-green-700 text-xs px-2 py-0.5">
                                  {serviceInfo.service}
                                </Badge>
                              </div>
                              <div className="mt-2">
                                <p className="text-[#2D2C2E]/100 text-xs mb-1">
                                  Notes:
                                </p>
                                <p className="text-[#2D2C2E]/100 text-xs font-bold bg-[#2D2C2E]/5 p-1.5 rounded">
                                  {serviceInfo.notes || "No notes available"}
                                </p>
                              </div>
                            </div>
                          ))}

                          {selectedPet.allServices?.length > 3 && (
                            <div className="pt-2 text-center">
                              <Button
                                onClick={() =>
                                  setShowAllServices(!showAllServices)
                                }
                                variant="outline"
                                className="text-sm hover:bg-[#FBBD0D]/10"
                              >
                                {showAllServices
                                  ? "Show Less"
                                  : `View ${
                                      selectedPet.allServices.length - 3
                                    } More`}
                              </Button>
                            </div>
                          )}

                          {selectedPet.allServices?.length === 0 && (
                            <div className="text-center py-4 text-[#2D2C2E]/60 text-sm">
                              No appointment history available
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
