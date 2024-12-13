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
import {
  DollarSign,
  CalendarIcon,
  PawPrint,
  Users,
  BedDouble,
} from "lucide-react";
import { databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite";
import { Query } from "appwrite";

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

        let allPetDocuments = [];
        let offset = 0;
        const limit = 1000; // Fetch 100 documents per page

        while (true) {
          const petCollection = await databases.listDocuments(
            databaseId,
            petCollectionId,
            [Query.limit(limit), Query.offset(offset)]
          );

          allPetDocuments = [...allPetDocuments, ...petCollection.documents];

          if (petCollection.documents.length < limit) {
            // No more documents to fetch
            break;
          }

          offset += limit;
        }

        console.log("Total Pet Documents:", allPetDocuments.length);

        // Count unique owners
        const uniqueOwners = new Set(
          allPetDocuments.map((pet) => pet.ownerId).filter(Boolean)
        );
        const totalOwners = uniqueOwners.size;

        // Filter pets with "Pet Boarding" service, "Clinic 1" in petClinic, and status "Accepted"
        const filteredPets = allPetDocuments.filter((doc) => {
          const petServices = Array.isArray(doc.petServices)
            ? doc.petServices
            : [];
          const petClinic = Array.isArray(doc.petClinic) ? doc.petClinic : [];
          const status = Array.isArray(doc.status) ? doc.status : [];

          return (
            petServices.includes("Pet Boarding") &&
            petClinic.includes("Clinic 1") &&
            status.includes("Accepted")
          );
        });

        // Log filtered pets for verification
        console.log("Filtered Pets:", filteredPets.length);

        // Calculate pet types within filtered pets
        const petTypeCounts = {
          dogs: 0,
          cats: 0,
          other: 0,
        };

        // Unique pets tracking
        const uniquePets = new Set();

        filteredPets.forEach((pet) => {
          // Use petName as unique identifier
          if (pet.petName) {
            uniquePets.add(pet.petName);

            // Count pet types
            const petType = pet.petType ? pet.petType.toLowerCase() : "other";

            if (petType === "dog") petTypeCounts.dogs++;
            else if (petType === "cat") petTypeCounts.cats++;
            else petTypeCounts.other++;
          }
        });

        // Calculate total revenue
        const totalRevenue = filteredPets.reduce((sum, pet) => {
          return sum + (Number(pet.petPayment) || 0);
        }, 0);

        // Calculate total appointments (filtered pets count)
        const totalAppointments = filteredPets.length;

        // Update state with calculated values
        setAnalytics((prevState) => ({
          ...prevState,
          totalPets: uniquePets.size,
          totalAppointments,
          totalRevenue,
          totalOwners,
          petTypes: {
            dogs: petTypeCounts.dogs,
            cats: petTypeCounts.cats,
          },
          // You can add more detailed calculations here
          monthlyData: calculateMonthlyData(filteredPets),
          roomOccupancy: calculateRoomOccupancy(filteredPets),
        }));
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };

    // Helper function to calculate monthly data
    const calculateMonthlyData = (pets) => {
      const monthlyStats = {};

      pets.forEach((pet) => {
        const petDateArray = pet.petDate || [];
        const petDate = petDateArray[0] ? new Date(petDateArray[0]) : null;
        const month = petDate
          ? petDate.toLocaleString("default", { month: "short" })
          : "Unknown";

        if (!monthlyStats[month]) {
          monthlyStats[month] = {
            month,
            revenue: 0,
            boardingRevenue: 0,
          };
        }

        const payment = Number(pet.petPayment) || 0;
        monthlyStats[month].revenue += payment;
        monthlyStats[month].boardingRevenue += payment;
      });

      return Object.values(monthlyStats);
    };

    // Helper function to calculate room occupancy
    const calculateRoomOccupancy = (pets) => {
      const roomCounts = {};

      pets.forEach((pet) => {
        const room = pet.petRoom;
        if (room) {
          roomCounts[room] = (roomCounts[room] || 0) + 1;
        }
      });

      return Object.entries(roomCounts).map(([name, value]) => ({
        name,
        value,
      }));
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
