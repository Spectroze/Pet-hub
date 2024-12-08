"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPinIcon } from "lucide-react";
import { databases, appwriteConfig, storage } from "@/lib/appwrite"; // Ensure storage is imported

export default function Clinic2() {
  const [rooms, setRooms] = useState([]); // Room data state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Modal open state

  // Fetch room data from the database
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.room2CollectionId
        );

        console.log("Fetched room data:", response.documents);

        const updatedRooms = await Promise.all(
          response.documents.map(async (room) => {
            let imageUrl = room.newImage;

            // Debug log to verify the value of newImage
            console.log(`Room ID: ${room.id}, Image URL: ${room.newImage}`);

            // If newImage is missing or empty, use a fallback image
            if (!imageUrl) {
              console.log(
                `Room ${room.id} is missing newImage. Using fallback image.`
              );
              imageUrl = "/images/placeholder.jpg"; // Fallback image URL
            } else if (imageUrl.startsWith("file://")) {
              // If newImage is a file ID, fetch its URL from Appwrite Storage API
              try {
                const fileResponse = await storage.getFilePreview(
                  appwriteConfig.bucketId,
                  imageUrl.replace("file://", "") // Remove 'file://' prefix to get file ID
                );
                imageUrl = fileResponse.href; // Get the public URL of the file
              } catch (error) {
                console.error(
                  "Error fetching file URL for room:",
                  room.id,
                  error
                );
                imageUrl = "/images/placeholder.jpg"; // Fallback image in case of error
              }
            }

            // Return the updated room data with the valid image URL
            return {
              ...room,
              newImage: imageUrl, // Ensure newImage is a valid URL or fallback
            };
          })
        );

        setRooms(updatedRooms);
      } catch (error) {
        console.error("Error fetching room data:", error.message);
      }
    };

    fetchRoomData();
  }, []);

  const getStatusColor = (status) => {
    console.log("Status:", status); // Debugging log to check the value of status

    switch (status) {
      case "Available":
        return "bg-green-500 text-white"; // Green for available
      case "Occupied":
        return "bg-red-500 text-white"; // Red for occupied
      case "Reserved":
        return "bg-yellow-500 text-black"; // Yellow for reserved
      case "Cleaning":
        return "bg-blue-500 text-white"; // Blue for cleaning
      default:
        return "bg-gray-500 text-white"; // Gray for no status
    }
  };

  // Function to handle room clicks and open modal
  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsDialogOpen(true);
  };

  // Function to convert index to alphabet (A, B, C, ...)
  const getRoomLetter = (index) => {
    return String.fromCharCode(65 + index); // Convert index to alphabet (A=65, B=66, etc.)
  };

  return (
    <div className="bg-muted rounded-xl overflow-hidden shadow-lg mb-20">
      <div className="relative">
        <img
          src="/images/clinic2.png"
          alt="Pet Boarding Room"
          width={800}
          height={500}
          className="w-full h-[300px] sm:h-[400px] object-cover"
          style={{ aspectRatio: "800/500", objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Pet Boarding 2
          </h2>

          {/* Location Icon with Link */}
          <a
            href="https://maps.app.goo.gl/HjLYe5TrBfYZjSdd7"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center mt-2 text-white gap-2 hover:underline"
          >
            <MapPinIcon className="w-5 h-5" />
            <span>Doc Tin</span>
          </a>
          <p className="text-sm sm:text-base text-white">
            Brgy, suklayin, gloria, Baler Aurora
          </p>
          <p className="text-sm sm:text-base text-white">
            "Inside the Chopel Arch"
          </p>
        </div>
      </div>

      {/* Room Previews Section */}
      <div className="p-4 sm:p-6">
        <h4 className="text-lg font-medium mb-2">Room Previews</h4>
        <div className="grid grid-cols-2 gap-4">
          {rooms.map((room, index) => {
            const roomLetter = getRoomLetter(index); // Convert index to letter
            return (
              <div
                key={room.id}
                className="p-4 border rounded-lg shadow-md bg-white flex flex-col items-center cursor-pointer"
                onClick={() => handleRoomClick(room)}
              >
                <img
                  src={room.newImage} // Use the fetched or fallback image URL
                  alt={room.name}
                  className="rounded-lg shadow-md w-full h-[100px] object-cover mb-2"
                />
                <h5 className="text-lg font-semibold">
                  Room {roomLetter} {room.name}
                </h5>

                {/* Styled Status Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(
                    room.status
                  )}`}
                >
                  {room.status || "No Status"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for Room Details */}
      <Dialog open={isDialogOpen} onOpenChange={() => setIsDialogOpen(false)}>
        <DialogContent>
          {selectedRoom && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRoom.name}</DialogTitle>
              </DialogHeader>
            
              {/* Display room details */}
              <img
                src={selectedRoom.newImage || "/images/placeholder.jpg"} // Fallback image if newImage is invalid
                alt={selectedRoom.name}
                className="rounded-lg shadow-md w-full h-auto mb-4"
              />
              <p className="text-sm">
                This Room Is:{" "}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(
                    selectedRoom.status
                  )}`}
                >
                  {selectedRoom.status || "No Status"}
                </span>
              </p>
              <DialogFooter>
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
