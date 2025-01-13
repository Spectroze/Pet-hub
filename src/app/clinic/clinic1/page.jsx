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
import { Query } from "appwrite";

export default function Clinic1() {
  const [rooms, setRooms] = useState([]); // Room data state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Modal open state

  // Fetch room data from the database
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        // First, fetch all appointments with "Accepted" status
        const appointmentsResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.petCollectionId,
          [Query.equal("status", ["Accepted"])]
        );

        console.log(
          "Found accepted appointments:",
          appointmentsResponse.documents
        );

        // Get rooms data
        const roomsResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId,
          [Query.limit(100)]
        );

        const updatedRooms = await Promise.all(
          roomsResponse.documents.map(async (room, index) => {
            let imageUrl = room.newImage || "/images/placeholder.jpg";

            // Handle file:// URLs
            if (imageUrl.startsWith("file://")) {
              try {
                const fileResponse = await storage.getFilePreview(
                  appwriteConfig.bucketId,
                  imageUrl.replace("file://", "")
                );
                imageUrl = fileResponse.href;
              } catch (error) {
                console.error(
                  "Error fetching file URL for room:",
                  room.id,
                  error
                );
                imageUrl = "/images/placeholder.jpg";
              }
            }

            // Check if this room has an accepted appointment
            const hasAcceptedAppointment = appointmentsResponse.documents.some(
              (appointment) => {
                const roomNumber = `Room ${index + 1}`;
                const isAccepted = appointment.petRoom[0] === roomNumber;

                console.log(`Checking ${roomNumber}:`, {
                  appointmentRoom: appointment.petRoom[0],
                  hasAcceptedStatus: isAccepted,
                });

                return isAccepted;
              }
            );

            // If room has an accepted appointment, mark as Reserved
            if (hasAcceptedAppointment) {
              console.log(`Setting Room ${index + 1} as Reserved`);
              return {
                ...room,
                status: "Reserved",
                newImage: imageUrl,
              };
            }

            return {
              ...room,
              newImage: imageUrl,
            };
          })
        );

        console.log("Final updated rooms:", updatedRooms);
        setRooms(updatedRooms);
      } catch (error) {
        console.error("Error fetching room data:", error.message);
      }
    };

    fetchRoomData();
  }, []);

  const getStatusColor = (status) => {
    const statusColors = {
      Available: "bg-green-500 text-white",
      Occupied: "bg-red-500 text-white",
      Reserved: "bg-yellow-500 text-black",
      Cleaning: "bg-blue-500 text-white",
      default: "bg-gray-500 text-white",
    };

    return statusColors[status] || statusColors["default"];
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsDialogOpen(true);
  };

  return (
    <div className="bg-muted rounded-xl overflow-hidden shadow-lg mb-20">
      <div className="relative">
        <img
          src="/images/clinic.png"
          alt="Pet Boarding Room"
          width={800}
          height={500}
          className="w-full h-[300px] sm:h-[400px] object-cover"
          style={{ aspectRatio: "800/500", objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Pet Boarding 1
          </h2>

          {/* Location Icon with Link */}
          <a
            href="https://maps.app.goo.gl/HjLYe5TrBfYZjSdd7"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center mt-2 text-white gap-2 hover:underline"
          >
            <MapPinIcon className="w-5 h-5" />
            <span>The animal Doctor</span>
          </a>
          <p className="text-sm sm:text-base text-white">
            Sitio Kinalapan Brgy. Pingit Baler Aurora
          </p>
        </div>
      </div>

      {/* Room Previews Section */}
      <div className="p-4 sm:p-6">
        <h4 className="text-lg font-medium mb-2">Room Previews</h4>
        <div className="grid grid-cols-2 gap-4">
          {rooms.map((room, index) => (
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
                Cage {index + 1} {room.name}
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
          ))}
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
