"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import { CalendarIcon, PawPrint, Users, BedDouble } from "lucide-react";
import { databases, account } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite";
import { Query } from "appwrite";

function AnalyticsCard({ title, value, icon: Icon }) {
  const formattedValue = title.toLowerCase().includes("revenue")
    ? `₱${value.toLocaleString()}`
    : value.toLocaleString();

  return (
    <Card className="bg-[#2D2C2E] shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-xs font-medium text-[#FAF5E6]">
          {title}
        </CardTitle>
        {title.toLowerCase().includes("revenue") ? (
          <span className="h-3 w-3 text-[#FBBD0D] font-bold">₱</span>
        ) : (
          <Icon className="h-3 w-3 text-[#FBBD0D]" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold text-[#FAF5E6]">{formattedValue}</div>
      </CardContent>
    </Card>
  );
}

const ROOM_COLORS = ["#FBBD0D", "#FD1F4A", "#2D2C2E", "#FAF5E6"];

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    totalAppointments: 0,
    totalPets: 0,
    totalOwners: 0,
    totalRevenue: 0,
    totalPetsBoarding: 0,
    monthlyData: [],
    roomOccupancy: [],
    petTypes: { dogs: 0, cats: 0, other: 0 },
  });
  const [userRole, setUserRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { databaseId, petCollectionId, userCollectionId } = appwriteConfig;

      if (!databaseId || !petCollectionId || !userCollectionId) {
        throw new Error("Missing collectionId or databaseId in appwriteConfig");
      }

      // Extract clinic number from role (assuming role format like "clinic 1")
      const clinicMatch = userRole.match(/clinic\s*(\d+)/i);
      const clinicNumber = clinicMatch ? clinicMatch[1] : null;

      if (!clinicNumber) {
        console.error("Invalid clinic role format:", userRole);
        return;
      }

      // Fetch documents with specific clinic and Done status
      const petCollection = await databases.listDocuments(
        databaseId,
        petCollectionId,
        [
          Query.equal("petClinic", `Clinic ${clinicNumber}`),
          Query.equal("status", ["Done"]),
        ]
      );

      const filteredPets = petCollection.documents;
      console.log("Filtered Done Appointments for Clinic:", filteredPets);

      // Calculate analytics from filtered pets
      // ... rest of your analytics calculations ...

      // Count unique owners
      const uniqueOwners = new Set(
        filteredPets.map((pet) => pet.ownerId).filter(Boolean)
      );
      const totalOwners = uniqueOwners.size;

      // Calculate pet types
      const petTypeCounts = {
        dogs: 0,
        cats: 0,
        other: 0,
      };

      // Unique pets tracking
      const uniquePets = new Set();

      filteredPets.forEach((pet) => {
        if (pet.petName) {
          uniquePets.add(pet.petName);

          const petType = pet.petType ? pet.petType.toLowerCase() : "other";

          if (petType === "dog") petTypeCounts.dogs++;
          else if (petType === "cat") petTypeCounts.cats++;
          else petTypeCounts.other++;
        }
      });

      // Calculate total revenue from completed appointments
      const totalRevenue = filteredPets.reduce((sum, pet) => {
        return sum + (Number(pet.petPayment) || 0);
      }, 0);

      // Update state with calculated values
      setAnalytics({
        totalPets: uniquePets.size,
        totalAppointments: filteredPets.length,
        totalRevenue,
        totalOwners,
        petTypes: petTypeCounts,
        monthlyData: calculateMonthlyData(filteredPets),
        roomOccupancy: calculateRoomOccupancy(filteredPets),
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError("Failed to fetch analytics data");
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    const fetchUserRoleAndAnalytics = async () => {
      try {
        // Fetch user role with improved error handling
        const user = await account.get();
        let role = "";

        // First try to get role from user preferences
        if (user.prefs && user.prefs.role) {
          role = user.prefs.role;
        } else {
          // If no role in prefs, try to fetch from users collection
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

        // Normalize the role
        role = role.toLowerCase().trim();
        setUserRole(role || "guest"); // Default to 'guest' if no role found

        // Only fetch analytics if we have a valid role
        if (role) {
          await fetchAnalyticsData();
        } else {
          console.warn("No valid role found for user");
        }
      } catch (error) {
        console.error("Error in fetchUserRoleAndAnalytics:", error);
        setUserRole("guest"); // Default to guest on error
      }
    };

    fetchUserRoleAndAnalytics();
  }, [fetchAnalyticsData]);

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
          appointments: 0,
        };
      }

      const payment = Number(pet.petPayment) || 0;
      monthlyStats[month].revenue += payment;
      monthlyStats[month].appointments += 1;
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

  return (
    <div className="min-h-screen bg-[#FAF5E6] p-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-[#2D2C2E] mb-6">Analytics</h1>
        {/* Analytics Cards Section */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          <AnalyticsCard
            title="Total Appointments"
            value={analytics.totalAppointments}
            icon={CalendarIcon}
          />
          <AnalyticsCard
            title="Total Pets"
            value={analytics.totalPets}
            icon={PawPrint}
          />
          <AnalyticsCard
            title="Total Owners"
            value={analytics.totalOwners}
            icon={Users}
          />
          <AnalyticsCard
            title="Total Revenue"
            value={analytics.totalRevenue}
            icon={() => <span className="font-bold">₱</span>}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-4 max-w-5xl mx-auto">
          <Card className="bg-[#2D2C2E] shadow-lg col-span-1">
            <CardHeader className="py-2">
              <CardTitle className="text-sm font-medium text-[#FAF5E6]">
                Monthly Revenue and Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[200px] sm:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyData}>
                  <XAxis dataKey="month" stroke="#FAF5E6" />
                  <YAxis yAxisId="left" stroke="#FBBD0D" />
                  <YAxis yAxisId="right" orientation="right" stroke="#FD1F4A" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2D2C2E",
                      border: "1px solid #FAF5E6",
                      color: "#FAF5E6",
                    }}
                    formatter={(value, name) => [
                      name === "Revenue" ? `₱${value.toLocaleString()}` : value,
                      name,
                    ]}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    fill="#FBBD0D"
                    name="Revenue"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="appointments"
                    fill="#FD1F4A"
                    name="Appointments"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#2D2C2E] shadow-lg col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-[#FAF5E6]">
                Pet Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[200px] sm:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Dogs", value: analytics.petTypes.dogs },
                      { name: "Cats", value: analytics.petTypes.cats },
                      { name: "Other", value: analytics.petTypes.other },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#FBBD0D"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    <Cell fill="#FBBD0D" />
                    <Cell fill="#FD1F4A" />
                    <Cell fill="#FAF5E6" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2D2C2E",
                      border: "1px solid #FAF5E6",
                      color: "#FAF5E6",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {userRole === "pet-boarding" && (
            <Card className="bg-[#2D2C2E] shadow-lg col-span-1 md:col-span-2 xl:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-[#FAF5E6]">
                  Room Occupancy
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.roomOccupancy}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#FBBD0D"
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
                        backgroundColor: "#2D2C2E",
                        border: "1px solid #FAF5E6",
                        color: "#FAF5E6",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
