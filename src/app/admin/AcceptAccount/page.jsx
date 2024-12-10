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
import { Client, Databases } from "appwrite"; // Import Appwrite SDK

// Initialize Appwrite Client
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67094c000023e950be96"); // Set endpoint and project ID
const databases = new Databases(client); // Create Databases instance

// Service collection info
const servicesCollectionId = "67570911000a102d0bb8";

export default function Acceptaccount() {
  const [userLogins, setUserLogins] = useState([]);
  const [services, setServices] = useState([]);

  // Fetch user logins and services data
  useEffect(() => {
    const fetchUserLogins = async () => {
      try {
        const response = await databases.listDocuments(
          "670a040f000893eb8e06", // databaseId (services collection)
          servicesCollectionId // servicesCollectionId
        );
        setUserLogins(response.documents); // Store the retrieved user logins
      } catch (error) {
        console.error("Error fetching user logins:", error.message);
      }
    };

    const fetchServices = async () => {
      try {
        const response = await databases.listDocuments(
          "670a040f000893eb8e06", // databaseId (services collection)
          servicesCollectionId // servicesCollectionId
        );
        setServices(response.documents); // Store the retrieved services
      } catch (error) {
        console.error("Error fetching services:", error.message);
      }
    };

    fetchUserLogins();
    fetchServices();
  }, []);

  // Handle status update when accepting a request
  const handleAccept = (userId) => {
    setUserLogins((prevLogins) =>
      prevLogins.map((login) =>
        login.id === userId ? { ...login, status: "accepted" } : login
      )
    );
  };

  // Handle decline action (change status to declined)
  const handleDecline = (userId) => {
    setUserLogins((prevLogins) =>
      prevLogins.map((login) =>
        login.id === userId ? { ...login, status: "declined" } : login
      )
    );
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[#FFA07A]">Username</TableHead>
                <TableHead className="text-[#FFA07A]">Email</TableHead>
                <TableHead className="text-[#FFA07A]">Login Time</TableHead>
                <TableHead className="text-[#FFA07A]">Role</TableHead>
                <TableHead className="text-[#FFA07A]">Phone</TableHead>
                <TableHead className="text-[#FFA07A]">Status</TableHead>
                <TableHead className="text-[#FFA07A]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userLogins.map((login) => (
                <TableRow key={login.id} className="border-b border-[#3D3D3D]">
                  <TableCell className="text-[#FFA07A]">{login.name}</TableCell>
                  <TableCell className="text-[#FFA07A]">
                    {login.email}
                  </TableCell>
                  <TableCell className="text-[#FFA07A]">
                    {new Date(login.$createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className="capitalize text-yellow-400">
                      {login.services || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="text-[#FFA07A]">
                    {login.phone || "N/A"}
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
        </CardContent>
      </Card>
    </div>
  );
}
