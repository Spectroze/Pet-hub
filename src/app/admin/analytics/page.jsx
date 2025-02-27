"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client, Databases } from "appwrite";
import Image from 'next/image';

// Initialize Appwrite Client
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67094c000023e950be96"); // Set endpoint and project ID
const databases = new Databases(client); // Create Databases instance

// Service collection info
const userCollectionId = "670a04240019b97fcf05";
const databaseId = "670a040f000893eb8e06";

export default function Acceptaccount() {
  const [userLogins, setUserLogins] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for fetching data
  const [fetchDisabled, setFetchDisabled] = useState(true);

  const handleLogin = async (email, password) => {
    try {
      const user = await signIn(email, password);
      if (user.status.includes("accepted")) {
        console.log("Login successful", user);
      } else if (user.status.includes("declined")) {
        console.error("This account is declined and cannot log in.");
      } else {
        console.error("This account is not accepted yet.");
      }
    } catch (error) {
      console.error("Login failed:", error.message);
    }
  };

  useEffect(() => {
    fetchUserData(); // Fetch user data on component mount
  }, []);

  // Function to handle the acceptance of a user request
  const handleAccept = async (userId) => {
    try {
      await databases.updateDocument(
        databaseId,
        userCollectionId,
        userId,
        { status: ["accepted"] } // Update status to accepted
      );
      setUserLogins((prevLogins) =>
        prevLogins.map((login) =>
          login.id === userId ? { ...login, status: "accepted" } : login
        )
      );
    } catch (error) {
      console.error("Error updating user status: ", error);
    }
  };

  // Function to handle the decline of a user request
  const handleDecline = async (userId) => {
    try {
      await databases.updateDocument(
        databaseId,
        userCollectionId,
        userId,
        { status: ["declined"] } // Update status to declined
      );
      setUserLogins((prevLogins) =>
        prevLogins.map((login) =>
          login.id === userId ? { ...login, status: "declined" } : login
        )
      );
    } catch (error) {
      console.error("Error updating user status: ", error);
    }
  };

  const fetchUserData = async () => {
    try {
      setFetchDisabled(true); // Disable fetching initially
      const response = await databases.listDocuments(
        databaseId,
        userCollectionId
      );
      // Filter out users with status exactly as ["Pending"] and role other than "user"
      const users = response.documents
        .filter(
          (doc) =>
            Array.isArray(doc.status) &&
            doc.status.includes("Pending") &&
            doc.role !== "user"
        )
        .map((doc) => ({
          id: doc.$id,
          name: doc.name,
          email: doc.email,
          phone: doc.phone,
          avatar: doc.avatar,
          role: doc.role,
          status: doc.status || ["Pending"], // Default status is ["Pending"]
        }));

      setUserLogins(users);
    } catch (error) {
      console.error("Error fetching user data: ", error);
    } finally {
      setFetchDisabled(false); // Re-enable fetching after data is loaded
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 bg-[#1C1C1C] min-h-screen">
      <Card className="bg-[#2C2C2C] border-[#3D3D3D] border rounded-lg p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#FFA07A]">
            User Login Feature Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? ( // Show loading indicator while fetching data
            <div className="text-center text-[#FFA07A]">Loading...</div>
          ) : (
            <div>
              <Button
                onClick={fetchUserData}
                disabled={fetchDisabled}
                className="bg-[#3D3D3D] text-[#FFA07A] hover:bg-[#4D4D4D] hover:text-[#FF8C00]"
              >
                Fetch Users
              </Button>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[#FFA07A]">Username</TableHead>
                    <TableHead className="text-[#FFA07A]">Email</TableHead>
                    <TableHead className="text-[#FFA07A]">Phone</TableHead>
                    <TableHead className="text-[#FFA07A]">Avatar</TableHead>
                    <TableHead className="text-[#FFA07A]">Role</TableHead>
                    <TableHead className="text-[#FFA07A]">Status</TableHead>
                    <TableHead className="text-[#FFA07A]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userLogins.map((login) => (
                    <TableRow
                      key={login.id}
                      className="border-b border-[#3D3D3D]"
                    >
                      <TableCell className="text-[#FFA07A]">
                        {login.name}
                      </TableCell>
                      <TableCell className="text-[#FFA07A]">
                        {login.email}
                      </TableCell>
                      <TableCell className="text-[#FFA07A]">
                        {login.phone || "N/A"}
                      </TableCell>
                      <TableCell>
                        {login.avatar ? (
                          <Image
                            src={login.avatar}
                            alt="User Avatar"
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-yellow-400">
                          {login.role || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`capitalize ${
                            login.status === "accepted"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {login.status || "pending"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {login.status !== "accepted" && (
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleAccept(login.id)}
                              variant="outline"
                              size="sm"
                              className="flex items-center bg-[#3D3D3D] text-[#FFA07A] hover:bg-[#4D4D4D] hover:text-[#FF8C00]"
                            >
                              <CheckCircle className="mr-1 h-4 w-4" /> Accept
                            </Button>
                            <Button
                              onClick={() => handleDecline(login.id)}
                              variant="outline"
                              size="sm"
                              className="flex items-center bg-[#3D3D3D] text-[#FFA07A] hover:bg-[#4D4D4D] hover:text-[#FF8C00]"
                            >
                              <XCircle className="mr-1 h-4 w-4" /> Decline
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
