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
import { Archive, RotateCcw, Search } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ArchivedAppointments() {
  const [archivedAppointments, setArchivedAppointments] = useState([
    {
      id: 1,
      petName: "Max",
      ownerName: "John Doe",
      species: "Dog",
      services: "Grooming",
      date: new Date(2023, 5, 15),
      time: "10:00 AM",
      reason: "Annual checkup",
    },
    {
      id: 2,
      petName: "Bella",
      ownerName: "Jane Smith",
      species: "Cat",
      services: "Vaccination",
      date: new Date(2023, 5, 20),
      time: "11:00 AM",
      reason: "Vaccination",
    },
    {
      id: 3,
      petName: "Charlie",
      ownerName: "Bob Johnson",
      species: "Dog",
      services: "Dental Cleaning",
      date: new Date(2023, 5, 25),
      time: "09:30 AM",
      reason: "Dental cleaning",
    },
    {
      id: 4,
      petName: "Luna",
      ownerName: "Alice Brown",
      species: "Dog",
      services: "Spaying",
      date: new Date(2023, 6, 1),
      time: "02:00 PM",
      reason: "Spaying",
    },
    {
      id: 5,
      petName: "Rocky",
      ownerName: "Charlie Wilson",
      species: "Cat",
      services: "X-ray",
      date: new Date(2023, 6, 5),
      time: "03:30 PM",
      reason: "X-ray",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleRestore = (id) => {
    setArchivedAppointments((prevAppointments) =>
      prevAppointments.filter((appointment) => appointment.id !== id)
    );
    toast.success("Appointment restored successfully!");
  };

  const filteredAppointments = archivedAppointments.filter(
    (appointment) =>
      appointment.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.services.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Archive className="h-6 w-6" />
          Archived Appointments
        </h2>
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-gray-500" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Pet Name</TableHead>
              <TableHead className="w-[150px]">Owner</TableHead>
              <TableHead className="w-[100px]">Species</TableHead>
              <TableHead className="w-[100px]">Services</TableHead>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead className="w-[100px]">Time</TableHead>
              <TableHead className="w-[100px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="font-medium">
                  {appointment.petName}
                </TableCell>
                <TableCell>{appointment.ownerName}</TableCell>
                <TableCell>{appointment.species}</TableCell>
                <TableCell>{appointment.services}</TableCell>
                <TableCell>{appointment.date.toLocaleDateString()}</TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(appointment.id)}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredAppointments.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No archived appointments found.
        </div>
      )}
    </div>
  );
}
