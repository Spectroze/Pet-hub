"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, PawPrint } from "lucide-react";
import { listAccounts, databases, appwriteConfig } from "../../../lib/appwrite";
import { Query } from "appwrite";

export default function Owners() {
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    const fetchOwnersAndPets = async () => {
      try {
        // Step 1: Fetch all user documents
        const users = await listAccounts();
        console.log("Fetched users:", users); // Log fetched users

        // Filter out users that are not of role "user"
        const filteredUsers = users.filter(
          (user) => user.role && user.role.toLowerCase() === "user"
        );
        console.log("Filtered users with 'user' role:", filteredUsers);

        // Step 2: Fetch pets for each filtered user using ownerId
        const ownersWithPets = await Promise.all(
          filteredUsers.map(async (user) => {
            try {
              // Fetch pets associated with this owner using the ownerId
              const petResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.petCollectionId,
                [Query.equal("ownerId", user.$id)]
              );

              console.log(`Pets for user ${user.$id}:`, petResponse.documents); // Log pets for debugging

              // Collect pet names or relevant pet details
              const pets = petResponse.documents.map(
                (pet) => pet.petName || "Unknown Pet"
              );

              // Return formatted owner data including their pets
              return {
                id: user.$id,
                name: user.name || "Unknown",
                email: user.email || "No Email",
                phone: user.phone || "No Phone",
                pets, // Use `pets` here instead of `petName`
                avatar: user.avatar || "/placeholder.svg",
              };
            } catch (petError) {
              console.error(
                `Error fetching pets for user ${user.$id}:`,
                petError
              );
              return {
                id: user.$id,
                name: user.name || "Unknown",
                email: user.email || "No Email",
                phone: user.phone || "No Phone",
                pets: [], // Use an empty array for `pets`
                avatar: user.avatar || "/placeholder.svg",
              };
            }
          })
        );

        setOwners(ownersWithPets);
      } catch (error) {
        console.error("Error fetching owners and pets:", error);
      }
    };

    fetchOwnersAndPets();
  }, []);

  return (
    <Card className="bg-gray-900 text-gray-100 shadow-lg border-gray-800">
      <CardHeader className="border-b border-gray-800 pb-4">
        <CardTitle className="text-2xl font-bold text-[#FF6B6B] flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-[#FF6B6B]" />
          Owner Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="rounded-lg border border-gray-700 overflow-hidden shadow-md bg-gray-800">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-800 hover:bg-gray-800">
                <TableHead className="text-primary font-semibold">
                  Owner
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Contact
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Pets
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.length > 0 ? (
                owners.map((owner) => (
                  <TableRow
                    key={owner.id}
                    className="hover:bg-gray-700 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={owner.avatar} alt={owner.name} />
                          <AvatarFallback>
                            {owner.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-primary">
                            {owner.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="flex items-center text-sm">
                          <Mail className="mr-2 h-4 w-4 text-[#FF6B6B]" />
                          {owner.email}
                        </p>
                        <p className="flex items-center text-sm">
                          <Phone className="mr-2 h-4 w-4 text-[#FF6B6B]" />
                          {owner.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {owner.pets.length > 0 ? (
                          owner.pets.map((pet, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-primary/10 text-primary"
                            >
                              {pet}
                            </Badge>
                          ))
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary"
                          >
                            No Pets
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="3" className="text-center text-gray-400">
                    No owners found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
