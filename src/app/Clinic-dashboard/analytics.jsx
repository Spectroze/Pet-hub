"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  PieChart,
  Pie,
  Cell,
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

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    totalAppointments: 0,
    totalPets: 0,
    totalOwners: 0,
    totalRevenue: 0,
    monthlyData: [],
    petTypeDistribution: { dogs: 0, cats: 0 },
  });
  const [filters, setFilters] = useState({
    selectedClinic: "Clinic 1",
    selectedPetType: "All",
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

        const clinics = ["Clinic 1", "Clinic 2"]; // Include all clinics here
        const allFilteredPets = [];

        for (const clinic of clinics) {
          const petCollection = await databases.listDocuments(
            databaseId,
            petCollectionId
          );

          const filteredPets = petCollection.documents.filter((doc) => {
            const petServices = doc.petServices || [];
            const petClinic = doc.petClinic || [];
            const status = doc.status || [];
            const petType = doc.petType || "Unknown";

            return (
              (petServices.includes("Pet Grooming") ||
                petServices.includes("Pet Veterinary")) &&
              petClinic.includes(clinic) &&
              (filters.selectedPetType === "All" ||
                petType === filters.selectedPetType) &&
              status.includes("Accepted")
            );
          });

          allFilteredPets.push(...filteredPets);
        }

        const uniquePets = new Set();
        allFilteredPets.forEach((doc) => {
          const petName = doc.petName || null;
          if (petName) uniquePets.add(petName);
        });

        const totalPets = uniquePets.size;

        const userCollection = await databases.listDocuments(
          databaseId,
          userCollectionId
        );

        const filteredUsers = userCollection.documents.filter((user) => {
          const userPets = allFilteredPets.filter(
            (pet) => pet.ownerId === user.accountId
          );
          return userPets.length > 0;
        });

        const totalOwners = filteredUsers.length;
        const totalAppointments = allFilteredPets.length;

        const monthlyStats = {};
        const petTypeCount = { dogs: 0, cats: 0, others: 0 };

        allFilteredPets.forEach((doc) => {
          const petServices = doc.petServices || [];
          const payment = doc.petPayment || 0;
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
            };
          }

          monthlyStats[month].revenue += payment;

          if (petServices.includes("Pet Grooming")) {
            monthlyStats[month].petGroomingRevenue += payment;
          }
          if (petServices.includes("Pet Veterinary")) {
            monthlyStats[month].veterinaryRevenue += payment;
          }

          const petType = doc.petType ? doc.petType.toLowerCase() : "other";
          if (petType === "dog") petTypeCount.dogs++;
          else if (petType === "cat") petTypeCount.cats++;
          else petTypeCount.others++;
        });

        const monthlyData = Object.values(monthlyStats);
        const totalRevenue = monthlyData.reduce(
          (sum, month) => sum + month.revenue,
          0
        );

        setAnalytics({
          totalAppointments,
          totalPets,
          totalOwners,
          totalRevenue,
          monthlyData,
          petTypeDistribution: petTypeCount,
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };

    fetchAnalyticsData();
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [filterType]: value }));
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        <Card className="bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-200">
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="month"
                    stroke="#8884d8"
                    tick={{ fill: "#ccc" }}
                  />
                  <YAxis
                    tick={{ fill: "#ccc" }}
                    domain={[0, "auto"]}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                    }}
                    labelStyle={{ color: "#fff" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend wrapperStyle={{ color: "#ccc" }} />
                  <Bar
                    name="Pet Grooming"
                    dataKey="petGroomingRevenue"
                    fill="#4ECDC4"
                    barSize={300}
                    maxBarSize={500}
                  />
                  <Bar
                    name="Pet Veterinary"
                    dataKey="veterinaryRevenue"
                    fill="#FF6B6B"
                    barSize={300}
                    maxBarSize={500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
                    { name: "Dogs", value: analytics.petTypeDistribution.dogs },
                    { name: "Cats", value: analytics.petTypeDistribution.cats },
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
                  <Cell fill="#FFC107" />
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
  );
}
