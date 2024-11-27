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
import { databases, appwriteConfig } from "../../../lib/appwrite"; // Import Appwrite config

export default function Owners() {
  const [owners, setOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch owners from the collection
  const fetchOwners = async () => {
    setIsLoading(true);
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId // Replace with your collection ID
      );

      // Filter users with role "user" only
      const fetchedOwners = response.documents
        .filter((owner) => owner.role === "user") // Only include role: "user"
        .map((owner) => ({
          id: owner.$id,
          name: owner.name || "Unknown Name",
          email: owner.email || "Unknown Email",
          phone: owner.phone || "Unknown Phone",
          avatar: owner.avatar || "https://i.pravatar.cc/150", // Default avatar
          ownerPhotoId: owner.ownerPhotoId || null, // Owner photo ID
          role: owner.role || "Unknown Role",
          status: owner.status || ["No Status"], // Status as an array
        }));

      setOwners(fetchedOwners);
    } catch (error) {
      console.error("Error fetching owners:", error.message);
      toast.error("Failed to fetch owner records.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch owners on component mount
  useEffect(() => {
    fetchOwners();
  }, []);

  return (
    <Card className="bg-gray-900 text-gray-100 shadow-2xl border-gray-800 rounded-xl">
      <CardHeader className="border-b border-gray-800 pb-4 bg-gray-850">
        <CardTitle className="text-2xl font-bold text-[#FF6B6B] flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-[#FF6B6B]" />
          Owner Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="rounded-lg border border-gray-700 overflow-hidden shadow-lg bg-gray-800/50 backdrop-blur-sm">
          {isLoading ? (
            <div className="text-center py-8 text-primary">
              <p className="text-lg font-semibold">Loading owner records...</p>
            </div>
          ) : owners.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800/80 hover:bg-gray-800/90">
                  <TableHead className="text-gray-100 font-bold text-lg">
                    Owner
                  </TableHead>
                  <TableHead className="text-gray-100 font-bold text-lg">
                    Contact
                  </TableHead>
                  <TableHead className="text-gray-100 font-bold text-lg">
                    Role
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {owners.map((owner) => (
                  <TableRow
                    key={owner.id}
                    className="hover:bg-gray-700/50 transition-colors duration-200 border-b border-gray-700/50"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 ring-2 ring-[#FF6B6B] ring-offset-2 ring-offset-gray-900">
                          <AvatarImage src={owner.avatar} alt={owner.name} />
                          <AvatarFallback className="bg-[#FF6B6B] text-white">
                            {owner.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-lg text-white">
                            {owner.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <p className="flex items-center text-sm text-gray-300 hover:text-white transition-colors">
                          <Mail className="mr-2 h-4 w-4 text-[#FF6B6B]" />
                          {owner.email}
                        </p>
                        <p className="flex items-center text-sm text-gray-300 hover:text-white transition-colors">
                          <Phone className="mr-2 h-4 w-4 text-[#FF6B6B]" />
                          {owner.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition-colors px-3 py-1 text-sm font-medium">
                        {owner.role}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-300">
              <p className="text-lg font-semibold">No owner records found.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
