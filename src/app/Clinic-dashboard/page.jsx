"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Appointments from "./appointment/page";
import Pets from "./pets/page";
import Feedback from "./feedback/page";
import Owners from "./owner/page";
import { getCurrentUser, fetchUserAndPetInfo, signOut } from "@/lib/appwrite";
import { logout } from "@/lib/appwrite"; // Ensure correct path
import {
  Menu,
  Home,
  Calendar as CalendarIcon,
  PawPrint,
  Users,
  BarChart2,
  LogOut,
  DollarSign,
  Scissors,
  Stethoscope,
  MessageCircle,
  Edit,
  MenuIcon,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";

const navigationItems = [
  { id: "overview", name: "Overview", icon: Home },
  { id: "appointments", name: "Appointments", icon: CalendarIcon },
  { id: "pets", name: "Pets", icon: PawPrint },
  { id: "owners", name: "Owners", icon: Users },
  { id: "feedback", name: "Feedback", icon: MessageCircle },
];

// Mock data for the analytics
const analyticsData = {
  totalAppointments: 1250,
  totalPets: 450,
  totalOwners: 890,
  totalRevenue: 78500,
};

// Updated mock data for the monthly analytics chart (removed petsBoarding)
const monthlyData = [
  {
    month: "Jan",
    appointments: 95,
    petGrooming: 50,
    veterinary: 80,
    revenue: 5200,
  },
  {
    month: "Feb",
    appointments: 100,
    petGrooming: 55,
    veterinary: 85,
    revenue: 5800,
  },
  {
    month: "Mar",
    appointments: 120,
    petGrooming: 60,
    veterinary: 90,
    revenue: 6500,
  },
  {
    month: "Apr",
    appointments: 110,
    petGrooming: 58,
    veterinary: 88,
    revenue: 6200,
  },
  {
    month: "May",
    appointments: 130,
    petGrooming: 65,
    veterinary: 95,
    revenue: 7000,
  },
  {
    month: "Jun",
    appointments: 140,
    petGrooming: 70,
    veterinary: 100,
    revenue: 7500,
  },
];

// Mock data for revenue analytics (removed boarding)
const revenueData = [
  { month: "Jan", checkups: 2000, surgeries: 1500, grooming: 700 },
  { month: "Feb", checkups: 2200, surgeries: 1700, grooming: 800 },
  { month: "Mar", checkups: 2500, surgeries: 2000, grooming: 800 },
  { month: "Apr", checkups: 2300, surgeries: 1800, grooming: 800 },
  { month: "May", checkups: 2700, surgeries: 2200, grooming: 700 },
  { month: "Jun", checkups: 2900, surgeries: 2400, grooming: 700 },
];

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

function Analytics() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ">
        <AnalyticsCard
          title="Total Appointments"
          value={analyticsData.totalAppointments}
          icon={CalendarIcon}
        />
        <AnalyticsCard
          title="Total Pets"
          value={analyticsData.totalPets}
          icon={PawPrint}
        />
        <AnalyticsCard
          title="Total Owners"
          value={analyticsData.totalOwners}
          icon={Users}
        />
        <AnalyticsCard
          title="Total Revenue"
          value={`$${analyticsData.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
        />
      </div>
      <Card className="bg-gray-800 text-gray-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-200">Monthly Analytics</CardTitle>
          <CardDescription className="text-gray-400">
            Appointments, Pet Grooming, Veterinary Services, and Revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              appointments: {
                label: "Appointments",
                color: "hsl(var(--chart-1))",
              },
              petGrooming: {
                label: "Pet Grooming",
                color: "hsl(var(--chart-2))",
              },
              veterinary: {
                label: "Veterinary",
                color: "hsl(var(--chart-3))",
              },
              revenue: {
                label: "Revenue",
                color: "hsl(var(--chart-4))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="appointments"
                  yAxisId="left"
                  fill="var(--color-appointments)"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                />
                <Bar
                  dataKey="petGrooming"
                  yAxisId="left"
                  fill="var(--color-petGrooming)"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                />
                <Bar
                  dataKey="veterinary"
                  yAxisId="left"
                  fill="var(--color-veterinary)"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  yAxisId="right"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-revenue)", strokeWidth: 2 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="bg-gray-800 text-gray-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-200">Revenue Analytics</CardTitle>
          <CardDescription className="text-gray-400">
            Breakdown of revenue sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              checkups: {
                label: "Checkups",
                color: "hsl(var(--chart-1))",
              },
              surgeries: {
                label: "Surgeries",
                color: "hsl(var(--chart-2))",
              },
              grooming: {
                label: "Grooming",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="checkups"
                  stroke="var(--color-checkups)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-checkups)", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="surgeries"
                  stroke="var(--color-surgeries)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-surgeries)", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="grooming"
                  stroke="var(--color-grooming)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-grooming)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClinicDashboard() {
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

  const handleLogout = async () => {
    try {
      await signOut(); // Ensure this is the imported function
      toast.success("Successfully logged out!");
      router.push("/"); // Redirect to login page
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Logout failed. Please try again.");
    }
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

  return (
    <div className="flex h-screen bg-[#111827] text-gray-100">
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
              <p className="text-xs text-gray-400">Pet Clinic</p>

              {isEditingOwner ? (
                <>
                  <Input
                    name="name"
                    value={ownerInfo.name}
                    onChange={handleOwnerChange}
                    placeholder="Name"
                    className="mt-2 bg-gray-700 text-gray-100"
                  />
                  <Input
                    name="email"
                    value={ownerInfo.email}
                    onChange={handleOwnerChange}
                    placeholder="Email"
                    className="mt-2 bg-gray-700 text-gray-100"
                  />
                  <Input
                    name="phone"
                    value={ownerInfo.phone}
                    onChange={handleOwnerChange}
                    placeholder="Phone"
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
          {navigationItems.map(({ id, name, icon: Icon }) => (
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
        {/* Logout Button */}
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

      <main className="flex-1 p-4 overflow-auto bg-gray-900">
        {activeSection === "overview" && <Analytics />}
        {activeSection === "appointments" && <Appointments />}
        {activeSection === "pets" && <Pets />}
        {activeSection === "owners" && <Owners />}
        {activeSection === "feedback" && <Feedback />}
      </main>
    </div>
  );
}
