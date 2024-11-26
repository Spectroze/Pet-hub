"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { getCurrentUser, fetchUserAndPetInfo } from "@/lib/appwrite";
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
  DollarSign,
  Home,
  Menu,
  PawPrint,
  BedDouble,
  LogOut,
  MessageCircle,
  MenuIcon,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import AppointmentCalendar from "../pet-boarding/appointments/page";
import PetRecords from "../pet-boarding/records/page";
import RoomManagement from "../pet-boarding/room/page";
import Notifications from "../pet-boarding/notifications/page";
import Feedback from "./feedback/page";
import { Input } from "@/components/ui/input";

// Mock data for quick stats
const quickStats = {
  totalPetsBoarding: 42,
  totalPets: 150,
  monthlyRevenue: 15000,
};

// Mock user data for the avatar
const ownerInfo = {
  name: "John Doe",
  avatarUrl: "/images/avatar-placeholder.png",
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

const roomOccupancy = [
  { name: "Room 1", value: 8 },
  { name: "Room 2", value: 10 },
  { name: "Room 3", value: 12 },
  { name: "Room 4", value: 7 },
];

const COLORS = ["#6366f1", "#22c55e", "#eab308", "#ef4444"];

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const toggleEditOwner = () => setIsEditingOwner((prev) => !prev);
  const [userId, setUserId] = useState(null); // Declare userId state
  const [loading, setLoading] = useState(true); // Add loading state

  const [ownerInfo, setOwnerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    avatarUrl: "/placeholder.svg",
  });
  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    setOwnerInfo((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser && currentUser.$id) {
          setUserId(currentUser.$id);
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error fetching current user: ", err);
        router.push("/");
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        // Fetch user and pet data associated with the authenticated user
        const { user, pet } = await fetchUserAndPetInfo(userId);

        // Update owner info state with user-specific data
        setOwnerInfo({
          name: user?.name || "Guest",
          avatarUrl: user?.avatar || "/placeholder.svg", // Default avatar if none exists
        });
      } catch (error) {
        console.error("Failed to load user or pet data:", error);
        setError("Failed to load user or pet data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);
  const handleSaveOwner = async () => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId,
        {
          name: ownerInfo.name,
          email: ownerInfo.email,
          phone: ownerInfo.phone,
        }
      );
      setIsEditingOwner(false);
      toast.success("Profile updated successfully!"); // Show success toast
    } catch (error) {
      console.error("Error updating owner:", error);
      toast.error("Failed to update profile."); // Show error toast
    }
  };
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
      case "feedback":
        return <Feedback />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Pets Boarding
          </CardTitle>
          <BedDouble className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {quickStats.totalPetsBoarding}
          </div>
          <p className="text-xs text-gray-400">Currently in our care</p>
        </CardContent>
      </Card>
      <Card className="bg-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
          <PawPrint className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quickStats.totalPets}</div>
          <p className="text-xs text-gray-400">Registered in our system</p>
        </CardContent>
      </Card>
      <Card className="bg-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${quickStats.monthlyRevenue}</div>
          <p className="text-xs text-gray-400">This month's earnings</p>
        </CardContent>
      </Card>
      <Card className="col-span-full bg-gray-800 text-white">
        <CardHeader>
          <CardTitle>Weekly Boarding Trends</CardTitle>
        </CardHeader>
        <CardContent className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={boardingTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
                labelStyle={{ color: "#9ca3af" }}
              />

              <Legend />
              <Bar dataKey="dogs" fill="#6366f1" />
              <Bar dataKey="cats" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="col-span-full md:col-span-2 bg-gray-800 text-white">
        <CardHeader>
          <CardTitle>Room Occupancy</CardTitle>
        </CardHeader>
        <CardContent className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roomOccupancy}
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
                {roomOccupancy.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const navItems = [
    { id: "overview", name: "Overview", icon: Home },
    { id: "appointments", name: "Appointments", icon: Calendar },
    { id: "petRecords", name: "Pet Records", icon: PawPrint },
    { id: "rooms", name: "Rooms", icon: BedDouble },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "feedback", name: "Feedback", icon: MessageCircle },
  ];

  const handleLogout = () => {
    toast.success("Successfully logged out!");
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside
        className={`bg-gray-800 ${
          sidebarOpen ? "w-64" : "w-20"
        } min-h-screen p-4 flex flex-col relative transition-all`}
      >
        <Button
          variant="outline"
          className={`absolute top-4 right-4 transition-all ${
            sidebarOpen ? "mr-2" : "ml-0"
          } bg-gray-700 text-gray-200 hover:bg-gray-600`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>

        <div className="flex flex-col items-center mt-16 space-y-2">
          {/* Avatar with onClick handler to toggle editing */}
          <Avatar
            className="h-20 w-20 border-2 border-gray-600 cursor-pointer"
            onClick={toggleEditOwner}
          >
            <AvatarImage src={ownerInfo.avatarUrl} alt="User" />
            <AvatarFallback>{ownerInfo.name?.[0] || "U"}</AvatarFallback>
          </Avatar>

          {sidebarOpen && (
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-200">
                {ownerInfo.name || "Guest"}
              </p>
              <p className="text-xs text-gray-400">Pet Boarding</p>

              {isEditingOwner ? (
                <>
                  <Input
                    name="name"
                    value={ownerInfo.name}
                    onChange={handleOwnerChange}
                    placeholder="Name"
                    className="mt-2 bg-gray-700 text-gray-100"
                  />

                  <Button
                    onClick={handleSaveOwner}
                    className="bg-blue-600 hover:bg-blue-700 text-white mt-2"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Save Profile
                  </Button>
                </>
              ) : (
                <></>
              )}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2 border-t border-gray-700 pt-4 mt-4">
          {navItems.map(({ id, name, icon: Icon }) => (
            <Button
              key={id}
              variant={activeSection === id ? "secondary" : "ghost"}
              className={`w-full justify-start ${!sidebarOpen && "px-2"} ${
                activeSection === id ? "bg-gray-700" : "hover:bg-gray-700"
              } text-gray-200`}
              onClick={() => setActiveSection(id)}
            >
              <Icon className={`h-5 w-5 ${sidebarOpen && "mr-2"}`} />
              {sidebarOpen && <span>{name}</span>}
            </Button>
          ))}
        </nav>
        <Button
          variant="ghost"
          className={`w-full mt-auto justify-start ${
            !sidebarOpen && "px-2"
          } text-red-500 hover:bg-gray-700`}
          onClick={handleLogout}
        >
          <LogOut className={`h-5 w-5 ${sidebarOpen && "mr-2"}`} />
          {sidebarOpen && <span>Logout</span>}
        </Button>
      </aside>
      {/* Main content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-0" : "ml-0"
        } overflow-auto bg-gray-900`}
      >
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <h1 className="text-xl font-bold text-white">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
        </header>
        <main className="p-4">{renderSection()}</main>
      </div>
    </div>
  );
}
