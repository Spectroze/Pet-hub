"use client";

import { useState } from "react";
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

export default function Pets() {
  const [petRecords, setPetRecords] = useState([
    {
      id: 1,
      name: "Max",
      species: "Dog",
      breed: "Labrador",
      age: 5,
      owner: "John Doe",
      lastCheckup: new Date(2023, 5, 15),
      photo: "https://placekitten.com/200/300",
    },
    {
      id: 2,
      name: "Whiskers",
      species: "Cat",
      breed: "Siamese",
      age: 3,
      owner: "Jane Smith",
      lastCheckup: new Date(2023, 5, 20),
      photo: "https://placekitten.com/200/300",
    },
    {
      id: 3,
      name: "Buddy",
      species: "Dog",
      breed: "Golden Retriever",
      age: 7,
      owner: "Bob Johnson",
      lastCheckup: new Date(2023, 5, 25),
      photo: "https://placekitten.com/200/300",
    },
    {
      id: 4,
      name: "Nemo",
      species: "Fish",
      breed: "Clownfish",
      age: 1,
      owner: "Alice Brown",
      lastCheckup: new Date(2023, 6, 1),
      photo: "https://placekitten.com/200/300",
    },
    {
      id: 5,
      name: "Tweety",
      species: "Bird",
      breed: "Canary",
      age: 2,
      owner: "Charlie Wilson",
      lastCheckup: new Date(2023, 6, 5),
      photo: "https://placekitten.com/200/300",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleEdit = (id) => {
    toast.success(`Editing pet record with ID: ${id}`);
  };

  const handleDelete = (id) => {
    setPetRecords((prevRecords) =>
      prevRecords.filter((record) => record.id !== id)
    );
    toast.success("Pet record deleted successfully!");
  };

  const filteredRecords = petRecords.filter(
    (record) =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-4 bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold flex items-center gap-2 text-purple-700">
          <PlusCircle className="h-8 w-8 text-purple-500" />
          Pet Records
        </h2>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Search className="h-5 w-5 text-purple-500" />
          <Input
            placeholder="Search pet records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm border-purple-300 focus:border-purple-500 focus:ring-purple-500"
          />
        </div>
      </div>
      <div className="rounded-md border border-purple-200 overflow-hidden bg-white shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-purple-100">
              <TableHead className="w-[150px] text-purple-700">Photo</TableHead>
              <TableHead className="w-[150px] text-purple-700">
                Pet Name
              </TableHead>
              <TableHead className="text-purple-700">Species</TableHead>
              <TableHead className="text-purple-700">Age</TableHead>
              <TableHead className="text-purple-700">Owner</TableHead>
              <TableHead className="text-right text-purple-700">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow
                key={record.id}
                className="hover:bg-purple-50 transition-colors"
              >
                <TableCell>
                  <img
                    src={record.photo}
                    alt={record.name}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                </TableCell>
                <TableCell className="font-medium text-purple-700">
                  {record.name}
                </TableCell>
                <TableCell>{record.species}</TableCell>
                <TableCell>{record.age} years</TableCell>
                <TableCell>{record.owner}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(record.id)}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                      className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-100"
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
      {filteredRecords.length === 0 && (
        <div className="text-center py-8 text-purple-500 bg-white rounded-lg shadow-inner">
          <PlusCircle className="h-12 w-12 mx-auto mb-4 text-purple-400" />
          <p className="text-lg font-semibold">No pet records found.</p>
          <p className="text-sm">
            Try adjusting your search or add a new pet record.
          </p>
        </div>
      )}
    </div>
  );
}
