"use client";

import React, { useState, useEffect } from "react";
import UserManagement from "../admin/users/page";
import CreateAccountForm from "../admin/createAccount/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChartIcon,
  Users,
  PieChartIcon,
  UserPlus,
  Menu,
  LogOut,
  DollarSign,
  Calendar,
  Dog,
  Cat,
  History,
  UserCheck,
} from "lucide-react";
import { appwriteConfig, signOut } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { Client, Databases } from "appwrite";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Activity_Log from "./activity_log/page";
import Acceptaccount from "./AcceptAccount/page";

// Mock data for charts
const monthlyRevenueData = [
  { name: "Jan", training: 4000, boarding: 3000, clinic: 5000, grooming: 2000 },
  { name: "Feb", training: 3500, boarding: 3200, clinic: 4800, grooming: 2200 },
  { name: "Mar", training: 4200, boarding: 3400, clinic: 5200, grooming: 2400 },
  { name: "Apr", training: 4800, boarding: 3600, clinic: 5500, grooming: 2600 },
  { name: "May", training: 5000, boarding: 3800, clinic: 5800, grooming: 2800 },
  { name: "Jun", training: 5500, boarding: 4000, clinic: 6000, grooming: 3000 },
];

const dogBreedData = [
  { name: "Labrador Retriever", value: 120 },
  { name: "German Shepherd", value: 100 },
  { name: "Golden Retriever", value: 90 },
  { name: "Bulldog", value: 80 },
  { name: "Poodle", value: 70 },
  { name: "Beagle", value: 60 },
  { name: "Rottweiler", value: 50 },
  { name: "Dachshund", value: 40 },
  { name: "Shih Tzu", value: 30 },
  { name: "Boxer", value: 20 },
  { name: "Others", value: 90 },
];

const catBreedsData = [
  { name: "Siamese", value: 80 },
  { name: "Persian", value: 70 },
  { name: "Maine Coon", value: 60 },
  { name: "Bengal", value: 50 },
  { name: "Sphynx", value: 40 },
  { name: "Ragdoll", value: 30 },
  { name: "Scottish Fold", value: 25 },
  { name: "Abyssinian", value: 20 },
  { name: "Burmese", value: 15 },
  { name: "Russian Blue", value: 10 },
  { name: "Others", value: 84 },
];

const COLORS = [
  "#FFA07A", // Light Salmon
  "#FFD700", // Gold
  "#FF8C00", // Dark Orange
  "#FF6347", // Tomato
  "#FF4500", // Orange Red
  "#FF7F50", // Coral
  "#FFA500", // Orange
  "#FF69B4", // Hot Pink
  "#FF1493", // Deep Pink
  "#FF00FF", // Magenta
  "#8B4513", // Saddle Brown
];

const chartStyle = {
  backgroundColor: "#2C2C2C",
  border: "1px solid #3D3D3D",
  borderRadius: "8px",
  padding: "16px",
};

function DonutChartComponent({ data, title }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const totalValue = isNaN(total) ? 0 : total; // Ensure it's not NaN

  return (
    <Card style={chartStyle}>
      <CardHeader>
        <CardTitle className="text-[#FFA07A]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-3xl font-bold fill-[#FFA07A]"
            >
              {totalValue}
            </text>
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
  );
}

const BarChartComponent = ({ data, title, dataKey = "value" }) => {
  return (
    <Card style={chartStyle}>
      <CardHeader>
        <CardTitle className="text-[#FFA07A]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3D3D3D" />
            <XAxis dataKey="name" stroke="#FFA07A" />
            <YAxis stroke="#FFA07A" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#2C2C2C",
                border: "1px solid #3D3D3D",
                color: "#FFA07A",
              }}
            />
            <Legend />
            <Bar dataKey={dataKey}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

function StatCard({ title, value, icon: Icon }) {
  return (
    <Card style={chartStyle}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[#FFA07A]">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-[#FFA07A]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#FFA07A]">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function PetcareAdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [data, setData] = useState({
    totalPets: 0,
    totalOwners: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    petServicesData: [], // Initialize as an empty array for chart data
    monthlyRevenueData: [], // Initialize as an empty array for chart data
    petTypeData: [], // Initialize as an empty array for chart data
    roomNumericData: [], // Add if room data is needed
    dogBreedData: 0,
    catBreedData: 0,
  });

  const router = useRouter();

  const client = new Client();
  client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

  const databases = new Databases(client);

  const sidebarItems = [
    { id: "overview", icon: BarChartIcon, label: "Overview" },
    { id: "users", icon: Users, label: "User Management" },
    { id: "createAccount", icon: UserPlus, label: "Create Account" },
    { id: "AcceptAccount", icon: UserCheck, label: "Accept Account" }, // Added Accept Account item
    { id: "activity_log", icon: History, label: "Activity Log" },
    { id: "logout", icon: LogOut, label: "Logout" },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    const confirmed = confirm("Are you sure you want to log out?");
    if (confirmed) {
      try {
        await signOut();
        router.push("/");
      } catch (error) {
        console.error("Failed to log out:", error);
      }
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all pets data
        const petsResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.petCollectionId
        );
        const petsData = petsResponse.documents || [];

        let totalPets = 0;
        let totalRevenue = 0;
        const monthlyRevenue = {}; // Object to store revenue by month
        const serviceCounts = {};
        const petTypeCounts = {};
        const catBreedCounts = {};
        const dogBreedCounts = {};
        const roomCounts = {}; // Object to store room counts

        // Loop through pets data
        petsData.forEach((pet) => {
          totalPets++;
          totalRevenue += pet.petPayment || 0;

          // Extract and group data by month (modified logic)
          const petDateArray = pet.petDate || [];
          const petDate = petDateArray[0] ? new Date(petDateArray[0]) : null;

          if (petDate) {
            // Parse date and extract month name
            const month = petDate.toLocaleString("default", { month: "short" });
            if (!monthlyRevenue[month]) {
              monthlyRevenue[month] = 0; // Initialize month if not exists
            }
            monthlyRevenue[month] += pet.petPayment || 0; // Add payment to respective month
          }

          // Count services
          const service = pet.petServices || "Unknown";
          serviceCounts[service] = (serviceCounts[service] || 0) + 1;

          // Count pet types
          const petType = pet.petType || "Unknown";
          petTypeCounts[petType] = (petTypeCounts[petType] || 0) + 1;

          // Count cat breeds
          if (pet.petType === "Cat") {
            const catBreed = pet.petSpecies || "Unknown";
            catBreedCounts[catBreed] = (catBreedCounts[catBreed] || 0) + 1;
          }

          // Count dog breeds
          if (pet.petType === "Dog") {
            const dogBreed = pet.petSpecies || "Unknown";
            dogBreedCounts[dogBreed] = (dogBreedCounts[dogBreed] || 0) + 1;
          }

          // Count appointments per room
          const petRooms = pet.petRoom || [];
          petRooms.forEach((roomName) => {
            roomCounts[roomName] = (roomCounts[roomName] || 0) + 1;
          });
        });

        // Prepare monthly revenue data for charts (from the extracted data)
        const monthlyRevenueData = Object.keys(monthlyRevenue).map((month) => ({
          name: month,
          value: monthlyRevenue[month], // Map 'total' to 'value'
        }));

        // Prepare room data for charts
        const roomNumericData = Object.keys(roomCounts).map((roomName) => ({
          name: roomName,
          value: roomCounts[roomName],
        }));

        // Prepare data for cat and dog breeds
        const catBreedData = Object.keys(catBreedCounts).map((breed) => ({
          name: breed,
          value: catBreedCounts[breed],
        }));

        const dogBreedData = Object.keys(dogBreedCounts).map((breed) => ({
          name: breed,
          value: dogBreedCounts[breed],
        }));

        const petServicesData = Object.keys(serviceCounts).map((service) => ({
          name: service,
          value: serviceCounts[service],
        }));

        const petTypeData = Object.keys(petTypeCounts).map((type) => ({
          name: type,
          value: petTypeCounts[type],
        }));

        // Fetch total users data (owners)
        const usersResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId
        );
        const usersData = usersResponse.documents || [];
        const totalOwners = usersData.length;

        // Set data state for rendering
        setData({
          totalPets,
          totalRevenue,
          totalAppointments: petsData.length, // Assuming each pet represents an appointment
          petServicesData,
          monthlyRevenueData, // Monthly revenue data
          petTypeData,
          catBreedData,
          dogBreedData,
          roomNumericData, // Room occupancy data
          totalOwners, // Set total number of owners
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [databases, appwriteConfig]);

  return (
    <div className="flex h-screen bg-[#1C1C1C] text-[#FFA07A]">
      {/* Sidebar */}
      <aside
        className={`bg-[#2C2C2C] text-[#FFA07A] ${
          isSidebarOpen ? "w-64" : "w-20"
        } min-h-screen p-4 transition-all duration-300 ease-in-out relative shadow-lg`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Toggle */}
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              onClick={toggleSidebar}
              className="text-[#FFA07A] hover:text-[#FF8C00]"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-12">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start mb-2 text-[#FFA07A] hover:text-[#FF8C00] ${
                  activeTab === item.id ? "bg-[#3D3D3D] shadow-md" : ""
                }`}
                onClick={() => {
                  if (item.id === "logout") {
                    handleLogout();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {isSidebarOpen && item.label}
              </Button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8 bg-[#1C1C1C]">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-[#FFA07A]">
              Dashboard Overview
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Pets" value={data?.totalPets} icon={Dog} />
              <StatCard
                title="Total Owners"
                value={data?.totalOwners}
                icon={Users}
              />
              <StatCard
                title="Total Revenue"
                value={`$${data?.totalRevenue.toLocaleString()}`} // Format as currency
                icon={DollarSign}
              />
              <StatCard
                title="Total Appointments"
                value={data.totalAppointments}
                icon={Calendar}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <BarChartComponent
                data={data?.monthlyRevenueData || []} // Dynamically fetched data
                title="Monthly Revenue"
                dataKey="value" // Use 'value' instead of 'total'
              />

              <BarChartComponent
                data={data?.petServicesData || []}
                title="Pet Services Distribution"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <DonutChartComponent
                data={data?.petTypeData || []} // Use dynamically fetched petTypeData
                title="Pet Type Distribution"
              />

              <DonutChartComponent
                data={data?.roomNumericData || []}
                title="Room Occupancy"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <BarChartComponent
                data={data?.catBreedData || []}
                title="Cat Breeds Distribution"
              />
              <BarChartComponent
                data={data?.dogBreedData || []}
                title="Dog Breeds Distribution"
              />
            </div>
          </div>
        )}

        {activeTab === "users" && <UserManagement />}
        {activeTab === "createAccount" && <CreateAccountForm />}
        {activeTab === "activity_log" && <Activity_Log />}
        {activeTab === "AcceptAccount" && <Acceptaccount />}
      </div>
    </div>
  );
}
