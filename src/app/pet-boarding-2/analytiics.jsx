"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { DollarSign, CalendarIcon, PawPrint, Users } from "lucide-react";
import { databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite";

function AnalyticsCard({ title, value, icon: Icon }) {
  return (
    <Card className="bg-gray-800 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-200">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-[#FF6B6B]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
      </CardContent>
    </Card>
  );
}

const ROOM_COLORS = ["#4ECDC4", "#45B7D1", "#FF6B6B", "#FFA07A"];

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    totalAppointments: 0,
    totalPets: 0,
    totalOwners: 0,
    totalRevenue: 0,
    totalPetsBoarding: 0,
    monthlyData: [],
    roomOccupancy: [
      { name: "Room 1", value: 8 },
      { name: "Room 2", value: 10 },
      { name: "Room 3", value: 12 },
      { name: "Room 4", value: 7 },
    ],
    petTypes: { dogs: 0, cats: 0 },
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const { databaseId, petCollectionId, userCollectionId } =
          appwriteConfig;

        if (!databaseId || !petCollectionId || !userCollectionId) {
          throw new Error(
            "Missing collectionId or databaseId in appwriteConfig"
          );
        }

        // Fetch documents from the pet collection
        const petCollection = await databases.listDocuments(
          databaseId,
          petCollectionId
        );

        // Filter pets with "Pet Boarding" service, "Clinic 1" in petClinic, and status "Accepted"
        const filteredPets = petCollection.documents.filter((doc) => {
          const petServices = doc.petServices || [];
          const petClinic = doc.petClinic || [];
          const status = doc.status || []; // Assuming status is an array
          return (
            petServices.includes("Pet Boarding") &&
            petClinic.includes("Clinic 2") &&
            status.includes("Accepted") // Only include pets with "Accepted" status
          );
        });

        // Calculate unique pets by name with "Pet Boarding" service, "Clinic 1" in petClinic, and status "Accepted"
        const uniquePets = new Set();
        let dogs = 0,
          cats = 0,
          others = 0;

        filteredPets.forEach((doc) => {
          const petServices = doc.petServices || [];
          const petClinic = doc.petClinic || [];
          const status = doc.status || [];
          const petName = doc.petName || null;
          const petType = doc.petType ? doc.petType.toLowerCase() : "other";

          if (
            petName &&
            petServices.includes("Pet Boarding") &&
            petClinic.includes("Clinic 2") &&
            status.includes("Accepted") // Only include pets with "Accepted" status
          ) {
            uniquePets.add(petName); // Add pet name to the Set to ensure uniqueness
            if (petType === "dog") dogs++;
            else if (petType === "cat") cats++;
            else others++;
          }
        });

        const totalPets = uniquePets.size; // Total unique pets

        // Fetch all user documents (owners)
        const userCollection = await databases.listDocuments(
          databaseId,
          userCollectionId
        );

        // Filter users based on their accountId, and match it with the pet's ownerId
        const filteredUsers = userCollection.documents.filter((user) => {
          // Check if the user has pets with the required services
          const userPets = filteredPets.filter(
            (pet) => pet.ownerId === user.accountId
          );
          return userPets.length > 0; // Only keep users that have relevant pets
        });

        const totalOwners = filteredUsers.length; // Total owners with pets having the required services

        // Calculate total appointments directly
        const totalAppointments = filteredPets.length; // Pets meeting the criteria are counted directly as appointments

        // Room Occupancy Calculation
        const roomOccupancyMap = {};

        filteredPets.forEach((doc) => {
          const petRoom = doc.petRoom || null; // Room field in the pet document
          if (petRoom) {
            if (!roomOccupancyMap[petRoom]) {
              roomOccupancyMap[petRoom] = 0;
            }
            roomOccupancyMap[petRoom] += 1; // Increment count for the room
          }
        });

        const roomOccupancy = Object.entries(roomOccupancyMap).map(
          ([room, count]) => ({
            name: room,
            value: count,
          })
        );

        // Monthly stats initialization
        const monthlyStats = {};

        // Calculate monthly revenue for "Pet Grooming", "Pet Veterinary", "Pet Boarding", and others
        filteredPets.forEach((doc) => {
          const petServices = doc.petServices || [];
          const petClinic = doc.petClinic || [];
          const payment = doc.petPayment || 0;

          // Extract month from petDate
          const petDateArray = doc.petDate || [];
          const petDate = petDateArray[0] ? new Date(petDateArray[0]) : null;
          const month = petDate
            ? petDate.toLocaleString("default", { month: "short" })
            : "Unknown";

          if (!monthlyStats[month]) {
            monthlyStats[month] = {
              month,
              revenue: 0,
              petGroomingRevenue: 0,
              veterinaryRevenue: 0,
              boardingRevenue: 0,
              clinicRevenue: 0,
            };
          }

          // Increment monthly revenue
          monthlyStats[month].revenue += payment;

          // Increment service-specific revenue
          if (petServices.includes("Pet Boarding")) {
            monthlyStats[month].boardingRevenue += payment;
          }
          if (petClinic.includes("Clinic 2")) {
            monthlyStats[month].clinicRevenue += payment;
          }
        });

        const monthlyData = Object.values(monthlyStats);

        // Calculate total revenue (from "Pet Grooming", "Pet Veterinary", "Pet Boarding", "Pet Clinic")
        const totalRevenue = monthlyData.reduce(
          (sum, month) => sum + month.revenue,
          0
        );

        // Simulate total pets boarding (you may want to replace this with actual data)
        const totalPetsBoarding = Math.floor(totalPets * 0.3);

        // Update analytics state
        setAnalytics((prevState) => ({
          ...prevState,
          totalAppointments,
          totalPets,
          totalOwners,
          totalRevenue,
          totalPetsBoarding,
          roomOccupancy,
          monthlyData,
          petTypes: { dogs, cats },
        }));
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="space-y-4">
        {/* Analytics Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsCard
            title="Total Appointments"
            value={analytics.totalAppointments.toLocaleString()}
            icon={CalendarIcon}
          />
          <AnalyticsCard
            title="Total Pets"
            value={analytics.totalPets.toLocaleString()}
            icon={PawPrint}
          />
          <AnalyticsCard
            title="Total Owners"
            value={analytics.totalOwners.toLocaleString()}
            icon={Users}
          />
          <AnalyticsCard
            title="Total Revenue"
            value={`$${analytics.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <Card className="bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-200">
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.monthlyData}>
                  <XAxis dataKey="month" stroke="#FFA07A" />
                  <YAxis stroke="#FFA07A" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2C2C2C",
                      border: "1px solid #3D3D3D",
                      color: "#FFA07A",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    fill="#4ECDC4"
                    name="Monthly Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-200">
                Room Occupancy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.roomOccupancy}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {analytics.roomOccupancy.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={ROOM_COLORS[index % ROOM_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2C2C2C",
                      border: "1px solid #3D3D3D",
                      color: "#FFA07A",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-200">
                Pet Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Dogs", value: analytics.petTypes.dogs },
                      { name: "Cats", value: analytics.petTypes.cats },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    <Cell fill="#4ECDC4" />
                    <Cell fill="#FF6B6B" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2C2C2C",
                      border: "1px solid #3D3D3D",
                      color: "#FFA07A",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
