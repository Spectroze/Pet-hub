"use client";

import React, { useState } from "react";
import UserManagement from "../admin/users/page";
import CreateAccountForm from "../admin/createAccount/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart as BarChartIcon,
  Users,
  PieChart as PieChartIcon,
  UserPlus,
  Menu,
  LogOut,
  DollarSign,
  Star,
  TrendingUp,
} from "lucide-react";
import { signOut } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
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

// Mock data for charts (unchanged)
const roomOccupancyData = [
  { name: "Room 1", value: 30 },
  { name: "Room 2", value: 25 },
  { name: "Room 3", value: 20 },
  { name: "Room 4", value: 15 },
];

const revenueData = [
  { name: "Jan", revenue: 4000, visitors: 400 },
  { name: "Feb", revenue: 3000, visitors: 300 },
  { name: "Mar", revenue: 5000, visitors: 500 },
  { name: "Apr", revenue: 4500, visitors: 450 },
  { name: "May", revenue: 6000, visitors: 600 },
  { name: "Jun", revenue: 5500, visitors: 550 },
];

const visitorData = [
  { name: "Jan", visitors: 1000 },
  { name: "Feb", visitors: 1500 },
  { name: "Mar", visitors: 1200 },
  { name: "Apr", visitors: 1800 },
  { name: "May", visitors: 2000 },
  { name: "Jun", visitors: 1700 },
];

const COLORS = [
  "#8B4513", // SaddleBrown
  "#A0522D", // Sienna
  "#CD853F", // Peru
  "#DEB887", // BurlyWood
  "#D2691E", // Chocolate
  "#B8860B", // DarkGoldenrod
];

const chartStyle = {
  backgroundColor: "#F5DEB3", // Wheat
  border: "1px solid #D2B48C", // Tan
  borderRadius: "8px",
  padding: "16px",
};

function DonutChartComponent({ data, title }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card style={chartStyle}>
      <CardHeader>
        <CardTitle className="text-[#8B4513]">{title}</CardTitle>
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
              className="text-3xl font-bold fill-[#8B4513]"
            >
              {total}
            </text>
            <Tooltip
              contentStyle={{
                backgroundColor: "#F5DEB3",
                border: "1px solid #D2B48C",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function BarChartComponent({ data, title, dataKey }) {
  return (
    <Card style={chartStyle}>
      <CardHeader>
        <CardTitle className="text-[#8B4513]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D2B48C" />
            <XAxis dataKey="name" stroke="#8B4513" />
            <YAxis stroke="#8B4513" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#F5DEB3",
                border: "1px solid #D2B48C",
              }}
            />
            <Legend />
            <Bar dataKey={dataKey} fill="#8B4513" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function AreaChartComponent({ data, title, dataKey }) {
  return (
    <Card style={chartStyle}>
      <CardHeader>
        <CardTitle className="text-[#8B4513]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D2B48C" />
            <XAxis dataKey="name" stroke="#8B4513" />
            <YAxis stroke="#8B4513" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#F5DEB3",
                border: "1px solid #D2B48C",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="#8B4513"
              fill="#DEB887"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function PetcareAdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const router = useRouter();

  const sidebarItems = [
    { id: "overview", icon: BarChartIcon, label: "Overview" },
    { id: "users", icon: Users, label: "User Management" },
    { id: "createAccount", icon: UserPlus, label: "Create Account" },
    { id: "analytics", icon: PieChartIcon, label: "Analytics" },
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

  return (
    <div className="flex h-screen bg-[#F5DEB3] text-[#8B4513]">
      {/* Sidebar */}
      <aside
        className={`bg-[#DEB887] text-[#8B4513] ${
          isSidebarOpen ? "w-64" : "w-20"
        } min-h-screen p-4 transition-all duration-300 ease-in-out relative shadow-lg`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Toggle */}
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              onClick={toggleSidebar}
              className="text-[#8B4513] hover:text-[#A0522D]"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-12">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start mb-2 text-[#8B4513] hover:text-[#A0522D] ${
                  activeTab === item.id ? "bg-[#F5DEB3] shadow-md" : ""
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
      <div className="flex-1 overflow-auto p-8 bg-[#F5DEB3]">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-[#8B4513]">
              Dashboard Overview
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card style={chartStyle}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#8B4513]">
                    Total Visitors
                  </CardTitle>
                  <Users className="h-4 w-4 text-[#8B4513]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#8B4513]">1,234</div>
                  <p className="text-xs text-[#A0522D] flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" /> Trending up by 5.2%
                    this month
                  </p>
                </CardContent>
              </Card>
              <Card style={chartStyle}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#8B4513]">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-[#8B4513]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#8B4513]">
                    $123,456
                  </div>
                  <p className="text-xs text-[#A0522D] flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" /> Trending up by 8.1%
                    this month
                  </p>
                </CardContent>
              </Card>
              <Card style={chartStyle}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#8B4513]">
                    Overall Rating
                  </CardTitle>
                  <Star className="h-4 w-4 text-[#8B4513]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#8B4513]">4.8/5</div>
                  <p className="text-xs text-[#A0522D]">
                    Based on 1,024 reviews
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <AreaChartComponent
                data={visitorData}
                title="Area Chart - Stacked"
                dataKey="visitors"
              />
              <BarChartComponent
                data={revenueData}
                title="Bar Chart - Multiple"
                dataKey="revenue"
              />
            </div>

            <div className="mt-6">
              <DonutChartComponent
                data={roomOccupancyData}
                title="Pie Chart - Donut with Text"
              />
            </div>
          </div>
        )}

        {activeTab === "users" && <UserManagement />}
        {activeTab === "createAccount" && <CreateAccountForm />}
      </div>
    </div>
  );
}
