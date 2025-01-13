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
import { toast } from "react-hot-toast";
import { databases, appwriteConfig, account } from "../../../lib/appwrite";
import { Query } from "appwrite";

export default function Owners() {
  const [owners, setOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const fetchUserRoleAndOwners = async () => {
      setIsLoading(true);
      setOwners([]);
      try {
        const user = await account.get();
        let role = "";

        if (user.prefs && user.prefs.role) {
          role = user.prefs.role;
        } else {
          try {
            const response = await databases.listDocuments(
              appwriteConfig.databaseId,
              appwriteConfig.userCollectionId,
              [Query.equal("accountId", user.$id)]
            );

            if (response.documents.length > 0) {
              role = response.documents[0].role || "";
            }
          } catch (docError) {
            console.warn(
              "Could not fetch user role from collection:",
              docError
            );
          }
        }

        role = role.toLowerCase().trim();
        setUserRole(role);

        if (role) {
          await fetchOwners(role);
        } else {
          toast.error("Invalid or missing user role. Please contact support.");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        toast.error("Failed to fetch user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoleAndOwners();
  }, []);

  const fetchOwners = async (role) => {
    try {
      const clinicMatch = role.match(/clinic\s*(\d+)/i);
      const clinicNumber = clinicMatch ? clinicMatch[1] : null;

      if (
        !clinicNumber ||
        isNaN(clinicNumber) ||
        clinicNumber < 1 ||
        clinicNumber > 10
      ) {
        toast.error("Invalid clinic number. Must be between 1 and 10.");
        return;
      }

      const petResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId,
        [
          Query.equal("petClinic", `Clinic ${clinicNumber}`),
          Query.equal("status", "Done"),
        ]
      );

      if (petResponse.documents.length === 0) {
        toast.info(
          `No completed appointments found for Clinic ${clinicNumber}`
        );
        return;
      }

      const ownerIds = [
        ...new Set(
          petResponse.documents.map((pet) => pet.ownerId).filter((id) => id)
        ),
      ];

      if (ownerIds.length === 0) {
        console.log("No owner IDs found in pet records");
        return;
      }

      const userResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("accountId", ownerIds)]
      );

      const fetchedOwners = userResponse.documents.map((owner) => ({
        id: owner.$id,
        name: owner.name || "Unknown Name",
        email: owner.email || "Unknown Email",
        phone: owner.phone || "Unknown Phone",
        avatar: owner.avatar || "https://i.pravatar.cc/150",
        role: owner.role || "Pet Owner",
        status: owner.status || ["Active"],
        pets: petResponse.documents
          .filter((pet) => pet.ownerId === owner.accountId)
          .map((pet) => ({
            name: pet.petName,
            species: pet.petSpecies,
            service: pet.petServices,
            status: pet.status,
            date: pet.petDate,
          })),
      }));

      setOwners(fetchedOwners);
    } catch (error) {
      console.error("Error fetching owners:", error.message);
      toast.error(`Failed to fetch owner records for Clinic ${clinicNumber}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5E6] p-8">
      <Card className="max-w-6xl mx-auto bg-white shadow-xl border-[#FBBDOD] rounded-xl overflow-hidden">
        <CardHeader className="border-b border-[#FBBDOD]/20 pb-4 bg-gradient-to-r from-[#FBBDOD]/10 to-transparent">
          <div className="text-center">
            <CardTitle className="text-3xl font-bold text-[#2D2C2E] flex items-center justify-center gap-2">
              <PawPrint className="h-8 w-8 text-[#FBBDOD]" />
              Owner Management
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-lg border border-[#FBBDOD]/20 overflow-hidden shadow-lg bg-white">
            {isLoading ? (
              <div className="text-center py-8 text-[#2D2C2E]">
                <p className="text-lg font-semibold">
                  Loading owner records...
                </p>
              </div>
            ) : owners.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#FBBDOD]/10 hover:bg-[#FBBDOD]/20">
                    <TableHead className="text-[#2D2C2E] font-bold text-lg">
                      Owner
                    </TableHead>
                    <TableHead className="text-[#2D2C2E] font-bold text-lg">
                      Contact
                    </TableHead>
                    <TableHead className="text-[#2D2C2E] font-bold text-lg">
                      Pets
                    </TableHead>
                    <TableHead className="text-[#2D2C2E] font-bold text-lg">
                      Role
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {owners.map((owner) => (
                    <TableRow
                      key={owner.id}
                      className="hover:bg-[#FAF5E6] transition-colors duration-200 border-b border-[#FBBDOD]/10"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 ring-2 ring-[#FBBDOD] ring-offset-2 ring-offset-white">
                            <AvatarImage src={owner.avatar} alt={owner.name} />
                            <AvatarFallback className="bg-[#FBBDOD] text-white">
                              {owner.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-lg text-[#2D2C2E]">
                              {owner.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <p className="flex items-center text-sm text-[#2D2C2E]/80 hover:text-[#2D2C2E] transition-colors">
                            <Mail className="mr-2 h-4 w-4 text-[#FD1F4A]" />
                            {owner.email}
                          </p>
                          <p className="flex items-center text-sm text-[#2D2C2E]/80 hover:text-[#2D2C2E] transition-colors">
                            <Phone className="mr-2 h-4 w-4 text-[#FD1F4A]" />
                            {owner.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {owner.pets.map((pet, index) => (
                            <Badge
                              key={index}
                              className="bg-[#FBBDOD]/50 text-[#2D2C2E] hover:bg-[#FBBDOD]/30 mr-2 mb-1"
                            >
                              {pet.name} ({pet.species})
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500 text-black hover:bg-[#FD1F4A]/20 transition-colors px-3 py-1 text-sm font-medium">
                          {owner.role}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-[#2D2C2E]/70">
                <p className="text-lg font-semibold">No owner records found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
