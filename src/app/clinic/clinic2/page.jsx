"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPinIcon } from "lucide-react";
import { databases, appwriteConfig, storage } from "@/lib/appwrite";
import Image from 'next/image';

export default function Clinic2() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.room2CollectionId
        );

        const updatedRooms = await Promise.all(
          response.documents.map(async (room) => {
            let imageUrl = room.newImage;

            if (!imageUrl) {
              return { ...room, newImage: "/images/placeholder.jpg" };
            }

            if (imageUrl.startsWith("file://")) {
              try {
                const fileResponse = await storage.getFilePreview(
                  appwriteConfig.bucketId,
                  imageUrl.replace("file://", "")
                );
                imageUrl = fileResponse.href;
              } catch (error) {
                imageUrl = "/images/placeholder.jpg";
              }
            }

            return { ...room, newImage: imageUrl };
          })
        );

        setRooms(updatedRooms);
      } catch (error) {
        console.error("Error:", error.message);
      }
    };

    fetchRoomData();
  }, []);

  const statusColors = {
    Available: "bg-green-500 text-white",
    Occupied: "bg-red-500 text-white",
    Reserved: "bg-yellow-500 text-black",
    Cleaning: "bg-blue-500 text-white",
    default: "bg-gray-500 text-white",
  };

  const StatusBadge = ({ status }) => (
    <span
      className={`px-3 py-1 rounded-full text-sm font-bold ${
        statusColors[status] || statusColors.default
      }`}
    >
      {status || "No Status"}
    </span>
  );

  return (
    <div className="bg-muted rounded-xl overflow-hidden shadow-lg mb-20">
      {/* Header Section */}
      <div className="relative">
        <Image
          src="/images/clinic2.png"
          alt="Pet Boarding Room"
          width={400}
          height={300}
          className="w-full h-auto"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold">Pet Boarding 2</h2>
          <a
            href="https://maps.app.goo.gl/HjLYe5TrBfYZjSdd7"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center mt-2 gap-2 hover:underline"
          >
            <MapPinIcon className="w-5 h-5" />
            <span>Doc Tin</span>
          </a>
          <p className="text-sm sm:text-base">
            Brgy, suklayin, gloria, Baler Aurora
          </p>
          <p className="text-sm sm:text-base">&quot;Inside the Chopel Arch&quot;</p>
        </div>
      </div>

      {/* Room Grid */}
      <div className="p-4 sm:p-6">
        <h4 className="text-lg font-medium mb-2">Room Previews</h4>
        <div className="grid grid-cols-2 gap-4">
          {rooms.map((room, index) => (
            <div
              key={room.id}
              onClick={() => {
                setSelectedRoom(room);
                setIsDialogOpen(true);
              }}
              className="p-4 border rounded-lg shadow-md bg-white flex flex-col items-center cursor-pointer"
            >
              <Image
                src={room.newImage}
                alt={room.name}
                width={400}
                height={300}
                className="rounded-lg shadow-md w-full h-[100px] object-cover mb-2"
              />
              <h5 className="text-lg font-semibold">
                Cage {String.fromCharCode(65 + index)} {room.name}
              </h5>
              <StatusBadge status={room.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Simplified Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedRoom && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRoom.name}</DialogTitle>
              </DialogHeader>
              <Image
                src={selectedRoom.newImage}
                alt={selectedRoom.name}
                width={400}
                height={300}
                className="rounded-lg shadow-md w-full mb-4"
              />
              <div className="flex justify-between items-center">
                <StatusBadge status={selectedRoom.status} />
                <Button size="sm" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
