"use client";

import { useState } from "react";
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
import {
  Bell,
  Calendar,
  Clock,
  DollarSign,
  Home,
  Menu,
  PawPrint,
  Plus,
  Users,
  X,
  Clipboard,
  BedDouble,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AppointmentCalendar from "../pet-boarding/appointments/page";
import PetRecords from "../pet-boarding/records/page";
import RoomManagement from "../pet-boarding/room/page";
import Notifications from "../pet-boarding/notifications/page";

// Mock data for quick stats
const quickStats = {
  totalPets: 42,
  upcomingCheckIns: 8,
  upcomingCheckOuts: 5,
  occupancyRate: 75,
  monthlyRevenue: 15000,
  newCustomers: 12,
};

// Mock data for charts
const boardingTrends = [
  { name: "Mon", dogs: 10, cats: 5, other: 2 },
  { name: "Tue", dogs: 12, cats: 6, other: 1 },
  { name: "Wed", dogs: 15, cats: 8, other: 3 },
  { name: "Thu", dogs: 11, cats: 7, other: 2 },
  { name: "Fri", dogs: 13, cats: 9, other: 4 },
  { name: "Sat", dogs: 18, cats: 11, other: 5 },
  { name: "Sun", dogs: 16, cats: 10, other: 3 },
];

const popularServices = [{ name: "Boarding", value: 60 }];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "appointments":
        return <AppointmentCalendar />;
      case "petRecords":
        return <PetRecords />;
      case "rooms":
        return <RoomManagement />;
      case "notifications":
        return <Notifications />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Pets Boarding
          </CardTitle>
          <PawPrint className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quickStats.totalPets}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Upcoming Check-ins
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {quickStats.upcomingCheckIns}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quickStats.occupancyRate}%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${quickStats.monthlyRevenue}</div>
        </CardContent>
      </Card>
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Weekly Boarding Trends</CardTitle>
        </CardHeader>
        <CardContent className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={boardingTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="dogs" fill="#8884d8" />
              <Bar dataKey="cats" fill="#82ca9d" />
              <Bar dataKey="other" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Popular Services</CardTitle>
        </CardHeader>
        <CardContent className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={popularServices}
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
                {popularServices.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const menuItems = [
    { name: "Overview", icon: Home, section: "overview" },
    { name: "Appointments", icon: Calendar, section: "appointments" },
    { name: "Pet Records", icon: Clipboard, section: "petRecords" },
    { name: "Rooms", icon: BedDouble, section: "rooms" },
    { name: "Notifications", icon: Bell, section: "notifications" },
  ];

  return (
    <div className="sidebar" inert>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <PawPrint className="h-6 w-6" />
            <span className="font-bold">Pet Paradise</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.section}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    activeSection === item.section && "bg-gray-800"
                  )}
                  onClick={() => setActiveSection(item.section)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 overflow-auto transition-all duration-300 ease-in-out",
          sidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        <header className="sticky top-0 z-40 bg-white border-b">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
            <div className="flex items-center space-x-4">
              {/* Add any header actions or user profile here */}
            </div>
          </div>
        </header>
        <main className="p-6">{renderSection()}</main>
      </div>
    </div>
  );
}
