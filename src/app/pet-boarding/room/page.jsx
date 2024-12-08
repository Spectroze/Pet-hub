"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { databases, appwriteConfig, storage } from "@/lib/appwrite"; // Add storage import for file upload
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ID } from "appwrite";

// Initial room structure (example)
const initialRooms = [
  { $id: null, number: ["1"], status: [], newImage: "" },
  { $id: null, number: ["2"], status: [], newImage: "" },
  { $id: null, number: ["3"], status: [], newImage: "" },
  { $id: null, number: ["4"], status: [], newImage: "" },
];

export default function RoomManagement() {
  const [rooms, setRooms] = useState(initialRooms);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(null); // Track new status before saving
  const [imageUrl, setImageUrl] = useState(null); // Track the URL of the uploaded image
  const fileInputRef = useRef(null);

  // Fetch room data from Appwrite database
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId
        );
        if (response.documents.length > 0) {
          const updatedRooms = response.documents.map((room) => {
            // If an image exists, fetch the public URL
            const imageUrl = room.newImage || "/images/placeholder.jpg";
            return {
              ...room,
              newImage: imageUrl, // Store the image URL in room data
            };
          });
          setRooms(updatedRooms);
        } else {
          console.log("No rooms found in the database. Using initial data.");
        }
      } catch (error) {
        console.error("Error fetching rooms from the database:", error.message);
      }
    };

    fetchRooms();
  }, []);

  // Handle room click (edit or view room details)
  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setNewStatus(room.status[0]);
    setImageUrl(room.newImage);
    setIsDialogOpen(true);
  };

  // Handle status change
  const handleStatusChange = (status) => {
    setNewStatus(status);
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Upload the image to Appwrite storage
      const uploadResponse = await storage.createFile(
        appwriteConfig.bucketId,
        ID.unique(),
        file
      );

      // Generate the public URL in the desired format
      const uploadedImageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.bucketId}/files/${uploadResponse.$id}/view?project=${appwriteConfig.projectId}`;
      setImageUrl(uploadedImageUrl); // Set the generated image URL
      console.log("Image uploaded successfully:", uploadedImageUrl);
    } catch (error) {
      console.error("Error uploading image:", error.message);
      toast.error("Failed to upload image. Please try again.");
    }
  };

  // Save room changes (including image URL)
  const saveRoomChanges = async () => {
    if (!selectedRoom || !newStatus) {
      toast.error("Please select a room and status before saving.");
      return;
    }

    try {
      const imageToSave = imageUrl || "/images/placeholder.jpg"; // Default to placeholder if no image uploaded

      const updatedRoom = {
        ...selectedRoom,
        status: [newStatus],
        newImage: imageToSave, // Save the generated public URL
      };

      if (!selectedRoom.$id) {
        const response = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId,
          ID.unique(),
          {
            number: selectedRoom.number,
            status: [newStatus],
            newImage: imageToSave, // Save public URL of image
          }
        );
        updatedRoom.$id = response.$id;
      } else {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId,
          selectedRoom.$id,
          {
            status: [newStatus],
            newImage: imageToSave, // Update public URL of image
          }
        );
      }

      const updatedRooms = rooms.map((room) =>
        room.number[0] === selectedRoom.number[0] ? updatedRoom : room
      );
      setRooms(updatedRooms);
      setSelectedRoom(updatedRoom);
      toast.success(`Room ${selectedRoom.number[0]} updated successfully.`);
    } catch (error) {
      console.error("Failed to update room:", error.message);
      toast.error("Failed to save room changes.");
    }
  };

  // Get room card color based on status
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

  // Add new room
  const handleAddNewRoom = async () => {
    try {
      const highestRoomNumber = rooms.reduce((max, room) => {
        return Math.max(max, parseInt(room.number[0], 10));
      }, 0);
      const newRoomNumber = highestRoomNumber + 1;

      const newRoom = {
        number: [newRoomNumber.toString()],
        status: ["Available"],
        newImage: "", // New image initially empty
      };

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.roomCollectionId,
        ID.unique(),
        newRoom
      );

      const updatedRooms = [...rooms, { ...newRoom, $id: response.$id }];
      setRooms(updatedRooms);
      toast.success(`Room ${newRoomNumber} added successfully.`);
    } catch (error) {
      console.error("Failed to add new room:", error.message);
      toast.error("Failed to add new room.");
    }
  };

  // Delete room
  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;

    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.roomCollectionId,
        selectedRoom.$id
      );
      const updatedRooms = rooms.filter(
        (room) => room.$id !== selectedRoom.$id
      );
      setRooms(updatedRooms);
      toast.success(`Room ${selectedRoom.number[0]} deleted successfully.`);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete room:", error.message);
      toast.error("Failed to delete the room.");
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
                key={room.number[0]}
                className={`h-24 flex flex-col items-center justify-center p-4 rounded-lg shadow-md cursor-pointer transition-colors ${getCardColor(
                  room.status[0]
                )}`}
                onClick={() => handleRoomClick(room)}
              >
                <div className="text-lg font-semibold">
                  Room {room.number[0]}
                </div>
                <div>{room.status[0]}</div>
                <img
                  src={room.newImage || "/images/placeholder.jpg"}
                  alt="Room"
                  className="mt-2 w-full h-16 object-cover rounded"
                />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleAddNewRoom}>
            Add New Room
          </Button>
        </CardFooter>
      </Card>

      {selectedRoom && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Room {selectedRoom.number[0]} Details</DialogTitle>
              <DialogDescription>Manage room details</DialogDescription>
            </DialogHeader>
            <div className="mb-4">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newStatus || selectedRoom.status[0]}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <Label htmlFor="image">Upload Room Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
              />
              {imageUrl && (
                <img src={imageUrl} alt="Room Image" className="mt-2" />
              )}
            </div>

            <DialogFooter>
              <Button onClick={saveRoomChanges}>Save Changes</Button>
              <Button variant="destructive" onClick={handleDeleteRoom}>
                Delete Room
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
