"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Appointments from "./appointment/page";
import Pets from "./pets/page";
import Owners from "./owner/page";
import Reports from "./reports/page";
import {
  Menu,
  Home,
  Calendar as CalendarIcon,
  PawPrint,
  Users,
  BarChart2,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "react-hot-toast"; // Import react-hot-toast
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation

// Mock user data for the avatar
const ownerInfo = {
  name: "John Doe",
  avatarUrl: "/images/avatar-placeholder.png", // Adjust path as needed
};

// Navigation Items
const navigationItems = [
  { name: "Overview", icon: Home },
  { name: "Appointments", icon: CalendarIcon },
  { name: "Pets", icon: PawPrint },
  { name: "Owners", icon: Users },
  { name: "Reports", icon: BarChart2 },
];

// Overview Component (Simple placeholder)
function Overview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold">Total Appointments</h2>
        <p className="text-2xl">24</p>
        <p className="text-sm text-muted-foreground">+10% from last month</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold">Total Pets</h2>
        <p className="text-2xl">145</p>
        <p className="text-sm text-muted-foreground">+5% from last month</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold">Total Owners</h2>
        <p className="text-2xl">98</p>
        <p className="text-sm text-muted-foreground">+2% from last month</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold">Revenue</h2>
        <p className="text-2xl">$12,345</p>
        <p className="text-sm text-muted-foreground">+15% from last month</p>
      </div>
    </div>
  );
}

export default function PetClinicDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    // Display toast on logout
    toast.success("Successfully logged out!");

    // Redirect to homepage after 1 second
    setTimeout(() => {
      router.push("/"); // Correct usage in the app directory
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

          {/* Logout Button under Reports */}
          <Button
            variant="ghost"
            className="w-full mt-8 flex items-center justify-start text-red-600" // Red color for logout
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {sidebarOpen && "Logout"}
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
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
