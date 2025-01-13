"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
} from "lucide-react";
import { appwriteConfig, signOut } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { Client, Databases, Query } from "appwrite";
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
  AreaChart,
  Area,
} from "recharts";
import { useAuthUserStore } from "@/store/user";

// Import other components
import UserManagement from "../admin/users/page";
import CreateAccountForm from "../admin/createAccount/page";
import Activity_Log from "./activity_log/page";

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
];

const chartStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "16px",
};

function PieChartComponent({ data, title }) {
  return (
    <Card style={chartStyle}>
      <CardHeader>
        <CardTitle className="text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
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
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                color: "#1f2937",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

const BarChartComponent = ({
  data,
  title,
  dataKey = "value",
  showCurrency = true,
}) => {
  return (
    <Card style={chartStyle}>
      <CardHeader>
        <CardTitle className="text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis
              stroke="#64748b"
              tickFormatter={(value) =>
                showCurrency
                  ? `₱${value.toLocaleString()}`
                  : value.toLocaleString()
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                color: "#1f2937",
              }}
              formatter={(value) => [
                showCurrency ? `₱${Number(value).toLocaleString()}` : value,
                showCurrency ? "Revenue" : "Count",
              ]}
            />
            <Legend />
            <Bar
              dataKey={dataKey}
              fill="#3b82f6"
              name={showCurrency ? "Revenue" : "Count"}
            >
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
  const generateSparklineData = () => {
    return Array.from({ length: 10 }, () => Math.floor(Math.random() * 100));
  };

  const colorMap = {
    "Total Pets": {
      text: "#22c55e",
      line: "rgba(34, 197, 94, 0.2)",
      gradient: "from-green-50 to-green-100",
    },
    "Total Owners": {
      text: "#3b82f6",
      line: "rgba(59, 130, 246, 0.2)",
      gradient: "from-blue-50 to-blue-100",
    },
    "Total Revenue": {
      text: "#a855f7",
      line: "rgba(168, 85, 247, 0.2)",
      gradient: "from-purple-50 to-purple-100",
    },
    "Total Appointments": {
      text: "#f59e0b",
      line: "rgba(245, 158, 11, 0.2)",
      gradient: "from-yellow-50 to-yellow-100",
    },
  };

  const colors = colorMap[title] || {
    text: "#64748b",
    line: "rgba(100, 116, 139, 0.2)",
    gradient: "from-gray-50 to-gray-100",
  };

  const formattedValue = title.toLowerCase().includes("revenue")
    ? `₱${value.toLocaleString()}`
    : value.toLocaleString();

  return (
    <Card className={`bg-gradient-to-br ${colors.gradient}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle
          className="text-sm font-medium"
          style={{ color: colors.text }}
        >
          {title}
        </CardTitle>
        {title.toLowerCase().includes("revenue") ? (
          <span className="font-bold" style={{ color: colors.text }}>
            ₱
          </span>
        ) : (
          <Icon className="h-4 w-4" style={{ color: colors.text }} />
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold" style={{ color: colors.text }}>
            {formattedValue}
          </div>
          <div className="h-[40px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={generateSparklineData().map((value, index) => ({
                  value,
                  index,
                }))}
              >
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors.text}
                  fill={colors.line}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PetcareAdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const clearAuthUser = useAuthUserStore((state) => state.clearAuthUser);
  const [data, setData] = useState({
    totalPets: 0,
    totalOwners: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    petServicesData: [],
    monthlyRevenueData: [],
    petTypeData: [],
    roomNumericData: [],
    dogBreedData: [],
    catBreedData: [],
    servicesFeeChartData: [],
    servicesFeesByClinic: [],
  });
  const [isMobile, setIsMobile] = useState(false);

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
    { id: "activity_log", icon: History, label: "Activity Log" },
    { id: "logout", icon: LogOut, label: "Logout" },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      clearAuthUser();
      router.push("/");
      toast.success("Logout successful!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Failed to log out:", error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all pets data without filter first
        const allPetsResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.petCollectionId
        );

        // Fetch Done status pets separately for services fees
        const donePetsResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.petCollectionId,
          [Query.equal("status", "Done")]
        );

        const allPetsData = allPetsResponse.documents || [];
        const donePetsData = donePetsResponse.documents || [];

        // Initialize data structures
        let totalPets = 0;
        let totalRevenue = 0;
        const monthlyRevenue = {};
        const serviceCounts = {};
        const petTypeCounts = {};
        const catBreedCounts = {};
        const dogBreedCounts = {};
        const roomCounts = {};
        const servicesFeesByClinic = {};

        // Process all pets data for general statistics
        allPetsData.forEach((pet) => {
          totalPets++;
          totalRevenue += pet.petPayment || 0;

          // Process date and monthly revenue
          const petDateArray = pet.petDate || [];
          const petDate = petDateArray[0] ? new Date(petDateArray[0]) : null;
          if (petDate) {
            const month = petDate.toLocaleString("default", { month: "short" });
            if (!monthlyRevenue[month]) {
              monthlyRevenue[month] = 0;
            }
            monthlyRevenue[month] += pet.petPayment || 0;
          }

          // Process services
          const service = pet.petServices || "Unknown";
          serviceCounts[service] = (serviceCounts[service] || 0) + 1;

          // Process pet types
          const petType = pet.petType || "Unknown";
          petTypeCounts[petType] = (petTypeCounts[petType] || 0) + 1;

          // Process breeds
          if (pet.petType === "Cat") {
            const catBreed = pet.petSpecies || "Unknown";
            catBreedCounts[catBreed] = (catBreedCounts[catBreed] || 0) + 1;
          }
          if (pet.petType === "Dog") {
            const dogBreed = pet.petSpecies || "Unknown";
            dogBreedCounts[dogBreed] = (dogBreedCounts[dogBreed] || 0) + 1;
          }

          // Process rooms
          const petRooms = pet.petRoom || [];
          petRooms.forEach((roomName) => {
            roomCounts[roomName] = (roomCounts[roomName] || 0) + 1;
          });
        });

        // Process Done status pets for services fees
        donePetsData.forEach((pet) => {
          if (pet.petClinic && pet.servicesFee) {
            const fee = parseFloat(pet.servicesFee) || 0;
            const clinic = pet.petClinic;

            if (!servicesFeesByClinic[clinic]) {
              servicesFeesByClinic[clinic] = 0;
            }
            servicesFeesByClinic[clinic] += fee;
          }
        });

        // Transform all data for charts
        const monthlyRevenueData = Object.entries(monthlyRevenue)
          .map(([month, value]) => ({
            name: month,
            value: value,
          }))
          .sort((a, b) => {
            const months = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
            return months.indexOf(a.name) - months.indexOf(b.name);
          });

        const servicesFeeChartData = Object.entries(servicesFeesByClinic)
          .map(([clinic, total]) => ({
            name: clinic,
            value: total,
          }))
          .sort((a, b) => b.value - a.value);

        const petServicesData = Object.entries(serviceCounts).map(
          ([service, count]) => ({
            name: service,
            value: count,
          })
        );

        const petTypeData = Object.entries(petTypeCounts).map(
          ([type, count]) => ({
            name: type,
            value: count,
          })
        );

        const roomNumericData = Object.entries(roomCounts).map(
          ([room, count]) => ({
            name: room,
            value: count,
          })
        );

        const catBreedData = Object.entries(catBreedCounts).map(
          ([breed, count]) => ({
            name: breed,
            value: count,
          })
        );

        const dogBreedData = Object.entries(dogBreedCounts).map(
          ([breed, count]) => ({
            name: breed,
            value: count,
          })
        );

        // Fetch users data
        const usersResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId
        );
        const usersData = usersResponse.documents || [];
        const totalOwners = usersData.length;

        // Update all data
        setData({
          totalPets,
          totalOwners,
          totalRevenue,
          totalAppointments: allPetsData.length,
          petServicesData,
          monthlyRevenueData,
          petTypeData,
          roomNumericData,
          catBreedData,
          dogBreedData,
          servicesFeeChartData,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      }
    };

    fetchData();
  }, [databases, appwriteConfig]);

  return (
    <div className="flex h-screen bg-[#FFFBF5] text-gray-800 relative">
      <ToastContainer />

      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed md:relative md:translate-x-0 z-30 bg-[#FFF8ED] border-r h-full transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <Button
          variant="ghost"
          className={`absolute top-4 right-4 transition-all ${
            isSidebarOpen ? "mr-2" : "ml-0"
          } text-gray-600 hover:bg-gray-100`}
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex flex-col h-full p-4">
          <div className="mt-12">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start mb-2 text-gray-600 transition-colors duration-200 hover:bg-[#FFF1DC] hover:text-gray-900 ${
                  !isSidebarOpen && "px-2"
                } ${activeTab === item.id ? "bg-[#FFF1DC] shadow-sm" : ""}`}
                onClick={() => {
                  if (item.id === "logout") {
                    handleLogout();
                  } else {
                    setActiveTab(item.id);
                    if (isMobile) {
                      setIsSidebarOpen(false);
                    }
                  }
                }}
              >
                <item.icon
                  className={`h-4 w-4 ${isSidebarOpen ? "mr-2" : ""}`}
                />
                {isSidebarOpen && item.label}
              </Button>
            ))}
          </div>
        </div>
      </aside>

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b p-4 flex items-center justify-between md:hidden">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="mr-2"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-800">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-8">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
                Dashboard Overview
              </h2>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Pets"
                  value={data?.totalPets}
                  icon={Dog}
                />
                <StatCard
                  title="Total Owners"
                  value={data?.totalOwners}
                  icon={Users}
                />
                <StatCard
                  title="Total Revenue"
                  value={`${data?.totalRevenue.toLocaleString()}`}
                />
                <StatCard
                  title="Total Appointments"
                  value={data.totalAppointments}
                  icon={Calendar}
                />
              </div>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <BarChartComponent
                  data={data?.petServicesData || []}
                  title="Pet Services Distribution"
                  showCurrency={false}
                />
                <BarChartComponent
                  data={data?.monthlyRevenueData || []}
                  title="Monthly Revenue"
                  showCurrency={true}
                />
              </div>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <PieChartComponent
                  data={data?.petTypeData || []}
                  title="Pet Type Distribution"
                />
                <PieChartComponent
                  data={data?.roomNumericData || []}
                  title="Room Occupancy"
                />
              </div>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <BarChartComponent
                  data={data?.catBreedData || []}
                  title="Cat Breeds Distribution"
                  showCurrency={false}
                />
                <BarChartComponent
                  data={data?.dogBreedData || []}
                  title="Dog Breeds Distribution"
                  showCurrency={false}
                />
              </div>

              <div className="grid gap-4 sm:gap-6 grid-cols-1">
                <BarChartComponent
                  data={data.servicesFeeChartData || []}
                  title="Services Fees by Clinic"
                  dataKey="value"
                />
              </div>
            </div>
          )}

          {activeTab === "users" && <UserManagement />}
          {activeTab === "createAccount" && <CreateAccountForm />}
          {activeTab === "activity_log" && <Activity_Log />}
        </main>
      </div>
    </div>
  );
}
