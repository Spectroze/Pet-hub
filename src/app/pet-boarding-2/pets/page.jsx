"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { databases, appwriteConfig } from "../../../lib/appwrite";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Pets() {
  const [petRecords, setPetRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch pet records from the database
  const fetchPetRecords = async () => {
    setIsLoading(true);
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId
      );
      const pets = response.documents.map((pet) => ({
        id: pet.$id,
        name: pet.petName,
        species: pet.petSpecies,
        age: pet.petAge || "Unknown Age",
        photo: pet.petPhotoId || "https://placekitten.com/200/300",
        services: pet.petServices || ["No Services Available"],
      }));
      setPetRecords(pets);
    } catch (error) {
      console.error("Error fetching pet records:", error.message);
      toast.error("Failed to fetch pet records.");
    } finally {
      setIsLoading(false);
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
              className="bg-gray-800 border-gray-700 overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
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
                      {record.services.map((service, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-[#FF6B6B] text-white hover:bg-[#FF8C8C]"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
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
    </div>
  );
}
