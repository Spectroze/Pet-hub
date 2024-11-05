"use client";
import React, { useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDaysIcon, CameraIcon, MapPinIcon } from "lucide-react"; // Icons

// Panorama Component
function Panorama() {
  const mesh = useRef(null);
  const texture = useLoader(
    THREE.TextureLoader,
    "/images/panorama.jpeg?height=2000&width=4000"
  );

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.0005;
    }
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

export default function Clinic2() {
  const [selectedRoom, setSelectedRoom] = useState(null);

  const roomPreviews = [
    { id: 1, name: "Room 1", imgSrc: "/images/room1.JPG" },
    { id: 2, name: "Room 2", imgSrc: "/images/room2.JPG" },
    { id: 3, name: "Room 3", imgSrc: "/images/room3.JPG" },
    { id: 4, name: "Room 4", imgSrc: "/images/room4.JPG" },
  ];

  return (
    <div className="bg-muted rounded-xl overflow-hidden shadow-lg mb-20">
      <div className="relative">
        <img
          src="/images/clinic.png"
          alt="Pet Boarding Room"
          width={800}
          height={500}
          className="w-fulls h-[300px] sm:h-[400px] object-cover"
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
        <div className="flex items-center gap-2 cursor-pointer">
          <CameraIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">Room Previews</h3>
        </div>

        {/* Panorama Room Viewer */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <CameraIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium">View 360 Camera</h3>
            </div>
          </DialogTrigger>
          <DialogContent className="w-full h-full max-w-none max-h-none p-0 m-0">
            <DialogHeader className="absolute z-10 top-0 left-0 p-4 text-white">
              <DialogTitle>Pet Boarding Room</DialogTitle>
              <DialogDescription>
                Take a virtual tour of our cozy pet boarding room.
              </DialogDescription>
            </DialogHeader>
            <div className="w-screen h-screen">
              <Canvas>
                {/* Camera Setup */}
                <PerspectiveCamera
                  makeDefault
                  fov={75} // Adjust Field of View for zoom effect
                  position={[0, 0, 10]} // Start farther back to allow zooming in
                />
                <Panorama />
                <OrbitControls
                  enableZoom={true} // Enable zooming
                  zoomSpeed={1.0} // Adjust zoom sensitivity
                  minDistance={5} // Prevent zooming too close
                  maxDistance={500} // Prevent zooming too far away
                  enablePan={false} // Disable panning
                  enableDamping={true}
                  dampingFactor={0.2}
                  rotateSpeed={-0.5}
                />
              </Canvas>
            </div>
          </DialogContent>
        </Dialog>

        {/* Room Previews Section */}
        <div className="mt-6">
          <h4 className="text-lg font-medium mb-2">Room Previews</h4>
          <div className="flex gap-4">
            {roomPreviews.map((room) => (
              <div
                key={room.id}
                className="w-[150px] h-[120px] cursor-pointer"
                onClick={() => setSelectedRoom(room)}
              >
                <img
                  src={room.imgSrc}
                  alt={room.name}
                  className="rounded-lg shadow-md w-full h-full object-cover"
                />
                <h5 className="text-center text-sm mt-1">{room.name}</h5>
              </div>
            ))}
          </div>
        </div>

        {/* Modal for Room Preview */}
        <Dialog
          open={!!selectedRoom}
          onOpenChange={() => setSelectedRoom(null)}
        >
          <DialogContent className="sm:max-w-lg space-y-4">
            {selectedRoom && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedRoom.name}</DialogTitle>
                </DialogHeader>
                <img
                  src={selectedRoom.imgSrc}
                  alt={selectedRoom.name}
                  className="w-full h-auto rounded-lg shadow-md"
                />
                <DialogFooter>
                  <Button onClick={() => setSelectedRoom(null)}>Close</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
