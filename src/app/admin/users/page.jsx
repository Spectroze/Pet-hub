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
import { databases, appwriteConfig } from "../../../lib/appwrite";

export default function Owners() {
  const [owners, setOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOwners = async () => {
    setIsLoading(true);
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId
      );

      const fetchedOwners = response.documents
        .filter((owner) => owner.role === "user")
        .map((owner) => ({
          id: owner.$id,
          name: owner.name || "Unknown Name",
          email: owner.email || "Unknown Email",
          phone: owner.phone || "Unknown Phone",
          avatar: owner.avatar || "https://i.pravatar.cc/150",
          ownerPhotoId: owner.ownerPhotoId || null,
          role: owner.role || "Unknown Role",
          status: owner.status || ["No Status"],
        }));

      setOwners(fetchedOwners);
    } catch (error) {
      console.error("Error fetching owners:", error.message);
      toast.error("Failed to fetch owner records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  return (
    <Card className="bg-[#FAF5E6] text-[#2D2C2E] shadow-xl border border-[#FBBD0D]/20 rounded-xl">
      <CardHeader className="border-b border-[#FBBD0D]/20 pb-4">
        <CardTitle className="text-2xl font-bold">
          <PawPrint className="h-6 w-6 text-[#FBBD0D]" />
          Owner Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="rounded-lg border border-[#FBBD0D]/30 overflow-hidden shadow-lg bg-white/50 backdrop-blur-sm">
          {isLoading ? (
            <div className="text-center py-8 text-[#2D2C2E]">
              <p className="text-lg font-semibold">Loading owner records...</p>
            </div>
          ) : owners.length > 0 ? (
            <>
              {/* Desktop View - Shows on larger screens, hides on mobile */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#FAF5E6] hover:bg-[#FAF5E6]/90">
                      <TableHead className="text-[#2D2C2E] font-bold text-lg">
                        Owner
                      </TableHead>
                      <TableHead className="text-[#2D2C2E] font-bold text-lg">
                        Contact
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
                        className="hover:bg-[#FAF5E6]/50 transition-colors duration-200 border-b border-[#FBBD0D]/20"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12 ring-2 ring-[#FBBD0D] ring-offset-2 ring-offset-[#FAF5E6]">
                              <AvatarImage
                                src={owner.avatar}
                                alt={owner.name}
                              />
                              <AvatarFallback className="bg-[#FBBD0D] text-[#2D2C2E]">
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
                            <p className="flex items-center text-sm text-[#2D2C2E]/70 hover:text-[#2D2C2E] transition-colors">
                              <Mail className="mr-2 h-4 w-4 text-[#FD1F4A]" />
                              {owner.email}
                            </p>
                            <p className="flex items-center text-sm text-[#2D2C2E]/70 hover:text-[#2D2C2E] transition-colors">
                              <Phone className="mr-2 h-4 w-4 text-[#FD1F4A]" />
                              {owner.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500 text-white hover:bg-green-600 transition-colors px-3 py-1 text-sm font-medium">
                            {owner.role}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View - Shows on mobile, hides on larger screens */}
              <div className="block sm:hidden">
                {owners.map((owner) => (
                  <div className="p-4 border-b border-[#FBBD0D]/20 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12 ring-2 ring-[#FBBD0D] ring-offset-2 ring-offset-[#FAF5E6] flex-shrink-0">
                        <AvatarImage src={owner.avatar} alt={owner.name} />
                        <AvatarFallback className="bg-[#FBBD0D] text-[#2D2C2E]">
                          {owner.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <p className="font-bold text-lg">{owner.name}</p>
                        <div className="space-y-2">
                          <p className="flex items-center text-sm">
                            <Mail className="mr-2 h-4 w-4" />
                            {owner.email}
                          </p>
                          <p className="flex items-center text-sm">
                            <Phone className="mr-2 h-4 w-4" />
                            {owner.phone}
                          </p>
                        </div>
                        <Badge className="bg-green-500 text-white">
                          {owner.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-[#2D2C2E]/70">
              <p className="text-lg font-semibold">No owner records found.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
