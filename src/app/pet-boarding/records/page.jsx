"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Edit, Trash2, PlusCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { databases, appwriteConfig } from "../../../lib/appwrite";

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
        breed: pet.petBreed || "Unknown Breed", // Add fallback
        age: pet.petAge || "Unknown Age", // Add fallback
        lastCheckup: pet.lastCheckup || "N/A",
        photo: pet.petPhotoId || "https://placekitten.com/200/300", // Default photo
      }));
      setPetRecords(pets);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching pet records:", error.message);
      toast.error("Failed to fetch pet records.");
      setIsLoading(false);
    }
  };

  // UseEffect to fetch records on component mount
  useEffect(() => {
    fetchPetRecords();
  }, []);

  // Handle search functionality
  const filteredRecords = petRecords.filter((record) =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (id) => {
    toast.success(`Editing pet record with ID: ${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId,
        id
      );
      setPetRecords((prevRecords) =>
        prevRecords.filter((record) => record.id !== id)
      );
      toast.success("Pet record deleted successfully!");
    } catch (error) {
      console.error("Error deleting pet record:", error.message);
      toast.error("Failed to delete pet record.");
    }
  };

  return (
    <div className="w-full space-y-4 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold flex items-center gap-2 text-[#FF6B6B]">
          <PlusCircle className="h-8 w-8 text-[#FF6B6B]" />
          Pet Records
        </h2>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Search className="h-5 w-5 text-white" />
          <Input
            placeholder="Search pet records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-gray-800 border-gray-700 focus:border-primary focus:ring-primary text-white"
          />
        </div>
      </div>
      {isLoading ? (
        <div className="text-center py-8 text-primary bg-gray-800 rounded-lg shadow-inner">
          <p className="text-lg font-semibold">Loading pet records...</p>
        </div>
      ) : (
        <div className="rounded-md border border-gray-700 overflow-hidden bg-gray-800 shadow-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-900">
                <TableHead className="w-[150px] text-white">Photo</TableHead>
                <TableHead className="w-[150px] text-white">Pet Name</TableHead>
                <TableHead className="text-white">Species</TableHead>
                <TableHead className="text-white">Age</TableHead>
                <TableHead className="text-right text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow
                  key={record.id}
                  className="hover:bg-gray-700 transition-colors"
                >
                  <TableCell>
                    <img
                      src={record.photo}
                      alt={record.name}
                      className="w-16 h-16 object-cover rounded-full"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    {record.name}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {record.species}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {record.age} years
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(record.id)}
                        className="flex items-center gap-2 text-primary hover:text-primary-foreground hover:bg-primary"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                        className="flex items-center gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {filteredRecords.length === 0 && !isLoading && (
        <div className="text-center py-8 text-primary bg-gray-800 rounded-lg shadow-inner">
          <PlusCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-lg font-semibold">No pet records found.</p>
          <p className="text-sm text-gray-400">
            Try adjusting your search or add a new pet record.
          </p>
        </div>
      )}
    </div>
  );
}
