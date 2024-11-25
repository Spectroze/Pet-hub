"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { databases, appwriteConfig } from "@/lib/appwrite";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialRooms = [
  { $id: null, number: "1", status: null },
  { $id: null, number: "2", status: null },
  { $id: null, number: "3", status: null },
  { $id: null, number: "4", status: null },
];

export default function RoomManagement() {
  const [rooms, setRooms] = useState(initialRooms);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId
        );
        if (response.documents.length > 0) {
          setRooms(response.documents);
        } else {
          console.log("No rooms found in database. Using initial data.");
        }
      } catch (error) {
        console.error("Error fetching rooms from database:", error.message);
      }
    };

    fetchRooms();
  }, []);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (status) => {
    if (!selectedRoom) {
      console.error("No room selected.");
      return;
    }

    try {
      let updatedRoom = { ...selectedRoom, status };

      if (!selectedRoom.$id) {
        const response = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId,
          ID.unique(),
          {
            number: selectedRoom.number,
            status: [status],
          }
        );
        updatedRoom = { ...selectedRoom, status, $id: response.$id };
        console.log(`Room ${selectedRoom.number} created in the database.`);
      } else {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId,
          selectedRoom.$id,
          {
            status: [status],
          }
        );
        console.log(`Room ${selectedRoom.number} updated in the database.`);
      }

      const updatedRooms = rooms.map((room) =>
        room.number === selectedRoom.number ? updatedRoom : room
      );
      setRooms(updatedRooms);
      setSelectedRoom(updatedRoom);

      // Show toast notification
      toast.success(
        `Status of Room ${selectedRoom.number} changed to ${status}`
      );
    } catch (error) {
      console.error(
        `Failed to update room ${selectedRoom.number}:`,
        error.message
      );
      toast.error("Failed to update the status. Please try again.");
    }
  };

  const getCardColor = (status) => {
    switch (status) {
      case "Occupied":
        return "bg-red-500 text-white";
      case "Available":
        return "bg-green-500 text-white";
      case "Reserved":
        return "bg-yellow-500 text-black";
      case "Cleaning":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Room Management
          </CardTitle>
          <CardDescription>View and manage room occupancy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rooms.map((room) => (
              <div
                key={room.number}
                className={`h-24 flex flex-col items-center justify-center p-4 rounded-lg shadow-md cursor-pointer transition-colors ${getCardColor(
                  room.status
                )}`}
                onClick={() => handleRoomClick(room)}
              >
                <div className="text-lg font-semibold">Room {room.number}</div>
                <div className="flex items-center gap-1">
                  {room.status || "No Status"}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Room {selectedRoom?.number}
            </DialogTitle>
            <DialogDescription>
              Manage room details and occupancy
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                onValueChange={(value) => handleStatusChange(value)}
                defaultValue={selectedRoom?.status || undefined}
              >
                <SelectTrigger className="col-span-3">
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
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => setIsDialogOpen(false)}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
