"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPinIcon, CameraIcon } from "lucide-react";
import { databases, appwriteConfig } from "@/lib/appwrite";

export default function Clinic2() {
  const [rooms, setRooms] = useState([]); // Room data state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Modal open state

  // Room Previews with Static Images
  const roomPreviews = [
    { id: "1", name: "Room 1", imgSrc: "/images/room1.JPG" },
    { id: "2", name: "Room 2", imgSrc: "/images/room2.JPG" },
    { id: "3", name: "Room 3", imgSrc: "/images/room3.JPG" },
    { id: "4", name: "Room 4", imgSrc: "/images/room4.JPG" },
  ];

  // Fetch room data from the database and merge with static images
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId
        );

        // Merge fetched data with static image previews
        const mergedRooms = roomPreviews.map((room) => {
          const fetchedRoom = response.documents.find(
            (doc) => doc.number[0] === room.id // Extracting the number from the database document
          );
          return {
            ...room,
            status: fetchedRoom ? fetchedRoom.status[0] : "No Status", // Extract the first status value
          };
        });

        setRooms(mergedRooms); // Update the rooms state with merged data
      } catch (error) {
        console.error("Error fetching room data:", error.message);
      }
    };

    fetchRoomData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-500 text-white";
      case "Occupied":
        return "bg-red-500 text-white";
      case "Reserved":
        return "bg-yellow-500 text-black";
      case "Cleaning":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
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
          {rooms.map((room) => (
            <div
              key={room.id}
              className="p-4 border rounded-lg shadow-md bg-white flex flex-col items-center cursor-pointer"
              onClick={() => handleRoomClick(room)}
            >
              <img
                src={room.imgSrc}
                alt={room.name}
                className="rounded-lg shadow-md w-full h-[100px] object-cover mb-2"
              />
              <h5 className="text-lg font-semibold">{room.name}</h5>

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
              <img
                src={selectedRoom.imgSrc}
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
