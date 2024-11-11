"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Appointments from "./appointment/page";
import Pets from "./pets/page";
import Owners from "./owner/page";
import {
  Menu,
  Home,
  Calendar as CalendarIcon,
  PawPrint,
  Users,
  BarChart2,
  LogOut,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
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

// Mock user data for the avatar
const ownerInfo = {
  name: "John Doe",
  avatarUrl: "/images/avatar-placeholder.png",
};

// Navigation Items
const navigationItems = [
  { name: "Overview", icon: Home },
  { name: "Appointments", icon: CalendarIcon },
  { name: "Pets", icon: PawPrint },
  { name: "Owners", icon: Users },
];

// Mock data for charts
const revenueData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 4500 },
  { name: "May", revenue: 5500 },
  { name: "Jun", revenue: 6000 },
];

const petGrowthData = [
  { name: "Jan", pets: 100 },
  { name: "Feb", pets: 120 },
  { name: "Mar", pets: 135 },
  { name: "Apr", pets: 140 },
  { name: "May", pets: 148 },
  { name: "Jun", pets: 155 },
];

const appointmentData = [
  { name: "Mon", appointments: 15 },
  { name: "Tue", appointments: 20 },
  { name: "Wed", appointments: 25 },
  { name: "Thu", appointments: 18 },
  { name: "Fri", appointments: 22 },
  { name: "Sat", appointments: 30 },
  { name: "Sun", appointments: 10 },
];

const petTypeData = [
  { name: "Dogs", value: 45 },
  { name: "Cats", value: 35 },
  { name: "Birds", value: 10 },
  { name: "Others", value: 10 },
];

const activeOwnersData = [
  { name: "Jan", owners: 80 },
  { name: "Feb", owners: 85 },
  { name: "Mar", owners: 90 },
  { name: "Apr", owners: 88 },
  { name: "May", owners: 95 },
  { name: "Jun", owners: 98 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function Overview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,345</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +10% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Owners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pet Growth</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                pets: {
                  label: "Pets",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={petGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="pets" fill="var(--color-pets)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weekly Appointments</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                appointments: {
                  label: "Appointments",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar
                    dataKey="appointments"
                    fill="var(--color-appointments)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pet Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                petTypes: {
                  label: "Pet Types",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={petTypeData}
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
                    {petTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Total Active Owners</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer
            config={{
              owners: {
                label: "Active Owners",
                color: "hsl(var(--chart-5))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeOwnersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="owners"
                  stroke="var(--color-owners)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PetClinicDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    toast.success("Successfully logged out!");
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-white ${
          sidebarOpen ? "w-64" : "w-20"
        } min-h-screen p-4 transition-all duration-300 ease-in-out relative`}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="absolute top-4 right-4"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mt-10 space-y-2">
          <Avatar className="h-20 w-20">
            <AvatarImage src={ownerInfo.avatarUrl} alt="User" />
            <AvatarFallback>{ownerInfo.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          {sidebarOpen && (
            <div className="text-center">
              <p className="text-sm font-medium">{ownerInfo.name || "Guest"}</p>
              <p className="text-xs text-gray-500">Clinic Name</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          {navigationItems.map((item) => (
            <Button
              key={item.name}
              variant={
                activeTab === item.name.toLowerCase() ? "secondary" : "ghost"
              }
              className={`w-full justify-start mb-2 ${
                sidebarOpen ? "pl-4" : "justify-center"
              }`}
              onClick={() => setActiveTab(item.name.toLowerCase())}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {sidebarOpen && item.name}
            </Button>
          ))}

          {/* Logout Button */}
          <Button
            variant="ghost"
            className="w-full mt-8 flex items-center justify-start text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {sidebarOpen && "Logout"}
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Dynamic Content */}
        {activeTab === "overview" && <Overview />}
        {activeTab === "appointments" && <Appointments />}
        {activeTab === "pets" && <Pets />}
        {activeTab === "owners" && <Owners />}
        {activeTab === "reports" && <Reports />}
      </main>
    </div>
  );
}
