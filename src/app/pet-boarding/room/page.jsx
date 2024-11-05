"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for rooms
const initialRooms = [
  { id: 1, number: "1", type: "Standard", status: "Occupied", pet: "Buddy" },
  { id: 2, number: "2", type: "Deluxe", status: "Available" },
  { id: 3, number: "3", type: "Standard", status: "Reserved" },
  { id: 4, number: "4", type: "Suite", status: "Cleaning" },
  { id: 5, number: "5", type: "Standard", status: "Available" },
  // Add more rooms as needed
];

export default function RoomManagement() {
  const [rooms, setRooms] = useState(initialRooms);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handle when a room is clicked, opens dialog
  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsDialogOpen(true);
  };

  // Handle status change of a room
  const handleStatusChange = (status) => {
    if (selectedRoom) {
      const updatedRooms = rooms.map((room) =>
        room.id === selectedRoom.id ? { ...room, status } : room
      );
      setRooms(updatedRooms);
      setSelectedRoom({ ...selectedRoom, status });
    }
  };

  // Assign colors based on room status
  const getStatusColor = (status) => {
    switch (status) {
      case "Occupied":
        return "bg-red-500";
      case "Available":
        return "bg-green-500";
      case "Reserved":
        return "bg-yellow-500";
      case "Cleaning":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Room Management</CardTitle>
          <CardDescription>View and manage room occupancy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rooms.map((room) => (
              <Button
                key={room.id}
                variant="outline"
                className="h-24 flex flex-col items-start justify-between p-4"
                onClick={() => handleRoomClick(room)}
              >
                <div className="font-semibold">Room {room.number}</div>
                <div className="text-sm">{room.type}</div>
                <Badge className={getStatusColor(room.status)}>
                  {room.status}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog for managing room details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room {selectedRoom?.number}</DialogTitle>
            <DialogDescription>
              Manage room details and occupancy
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select
                onValueChange={(value) => handleStatusChange(value)}
                defaultValue={selectedRoom?.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedRoom?.pet && (
              <div>
                <Label>Pet in the room</Label>
                <div className="font-medium">{selectedRoom.pet}</div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
