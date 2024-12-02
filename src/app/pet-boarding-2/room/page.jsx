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
import { databases, appwriteConfig } from "@/lib/appwrite"; // Ensure ID is imported
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ID } from "appwrite";

// Initial Room Data
const initialRooms = [
  { $id: null, letter: "A", status: null },
  { $id: null, letter: "B", status: null },
  { $id: null, letter: "C", status: null },
  { $id: null, letter: "D", status: null },
];

export default function RoomManagement() {
  const [rooms, setRooms] = useState(initialRooms);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.room2CollectionId
        );
        if (response.documents.length > 0) {
          setRooms(response.documents);
        } else {
          console.log("No rooms found in database. Using initial data.");
          setRooms(initialRooms); // Set the rooms to initial data if the database is empty
        }
      } catch (error) {
        console.error("Error fetching rooms from database:", error.message);
        setRooms(initialRooms); // Fallback to initial data if there is an error fetching rooms
      }
    };

    fetchRooms();
  }, []);

  // Handle when a room is clicked
  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsDialogOpen(true);
  };

  // Handle room status change
  const handleStatusChange = async (status) => {
    if (!selectedRoom) {
      console.error("No room selected.");
      return;
    }

    try {
      let updatedRoom = { ...selectedRoom, status };

      if (!selectedRoom.$id) {
        // Creating a new room if no $id exists
        const response = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.room2CollectionId,
          ID.unique(), // Ensure ID is used here
          {
            letter: [selectedRoom.letter], // Ensure letter is an array
            status: [status],
          }
        );
        updatedRoom = { ...selectedRoom, status, $id: response.$id }; // Ensure $id is set
        console.log(`Room ${selectedRoom.letter} created in the database.`);
      } else {
        // Updating an existing room
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.room2CollectionId,
          selectedRoom.$id,
          {
            status: [status], // Only update the status
          }
        );
        console.log(`Room ${selectedRoom.letter} updated in the database.`);
      }

      // Update the local state with the modified room
      const updatedRooms = rooms.map((room) =>
        room.letter === selectedRoom.letter ? updatedRoom : room
      );
      setRooms(updatedRooms);
      setSelectedRoom(updatedRoom);

      // Show toast notification
      toast.success(
        `Status of Room ${selectedRoom.letter} changed to ${status}`
      );
    } catch (error) {
      console.error(
        `Failed to update room ${selectedRoom.letter}:`,
        error.message
      );
      toast.error("Failed to update the status. Please try again.");
    }
  };

  // Get the card color based on room status
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
            {isLoading ? (
              <div className="col-span-4 text-center">Loading rooms...</div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.letter}
                  className={`h-24 flex flex-col items-center justify-center p-4 rounded-lg shadow-md cursor-pointer transition-colors ${getCardColor(
                    room.status
                  )}`}
                  onClick={() => handleRoomClick(room)}
                >
                  <div className="text-lg font-semibold">
                    Room {room.letter}
                  </div>
                  <div className="flex items-center gap-1">
                    {room.status || "No Status"}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Room {selectedRoom?.letter}
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
