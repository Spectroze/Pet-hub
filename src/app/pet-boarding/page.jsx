"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
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
} from "recharts"
import {
  Bell,
  Calendar,
  Clock,
  DollarSign,
  Home,
  Menu,
  PawPrint,
  Clipboard,
  BedDouble,
  LogOut,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import AppointmentCalendar from "../pet-boarding/appointments/page"
import PetRecords from "../pet-boarding/records/page"
import RoomManagement from "../pet-boarding/room/page"
import Notifications from "../pet-boarding/notifications/page"
import Feedback from "./feedback/page"

// Mock data for quick stats
const quickStats = {
  totalPets: 42,
  upcomingCheckIns: 8,
  upcomingCheckOuts: 5,
  occupancyRate: 75,
  monthlyRevenue: 15000,
  newCustomers: 12,
}

// Mock user data for the avatar
const ownerInfo = {
  name: "John Doe",
  avatarUrl: "/images/avatar-placeholder.png", // Adjust path as needed
}

// Mock data for charts
const boardingTrends = [
  { name: "Mon", dogs: 10, cats: 5, other: 2 },
  { name: "Tue", dogs: 12, cats: 6, other: 1 },
  { name: "Wed", dogs: 15, cats: 8, other: 3 },
  { name: "Thu", dogs: 11, cats: 7, other: 2 },
  { name: "Fri", dogs: 13, cats: 9, other: 4 },
  { name: "Sat", dogs: 18, cats: 11, other: 5 },
  { name: "Sun", dogs: 16, cats: 10, other: 3 },
]

const popularServices = [{ name: "Boarding", value: 60 }]
const COLORS = ["#6366f1", "#22c55e", "#eab308"]

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview()
      case "appointments":
        return <AppointmentCalendar />
      case "petRecords":
        return <PetRecords />
      case "rooms":
        return <RoomManagement />
      case "notifications":
        return <Notifications />
      case "feedback":
        return <Feedback />
      default:
        return renderOverview()
    }
  }

  const renderOverview = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pets Boarding</CardTitle>
          <PawPrint className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quickStats.totalPets}</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Check-ins</CardTitle>
          <Clock className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quickStats.upcomingCheckIns}</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
          <Home className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quickStats.occupancyRate}%</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${quickStats.monthlyRevenue}</div>
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
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
              <Legend />
              <Bar dataKey="dogs" fill="#6366f1" />
              <Bar dataKey="cats" fill="#22c55e" />
              <Bar dataKey="other" fill="#eab308" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-gray-800 text-white">
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
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {popularServices.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )

  const menuItems = [
    { name: "Overview", icon: Home, section: "overview" },
    { name: "Appointments", icon: Calendar, section: "appointments" },
    { name: "Pet Records", icon: PawPrint, section: "petRecords" },
    { name: "Rooms", icon: BedDouble, section: "rooms" },
    { name: "Notifications", icon: Bell, section: "notifications" },
    { name: "Feedback", icon: MessageCircle, section: "feedback" },
  ]

  const handleLogout = () => {
    toast.success("Successfully logged out!")
    setTimeout(() => {
      router.push("/") // Redirect to homepage after 1 second
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className={`bg-gray-800 fixed top-0 left-0 ${sidebarOpen ? "w-56" : "w-20"} h-full p-2 transition-all duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="absolute top-2 right-2 text-white hover:bg-gray-700">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        {/* Avatar and Sidebar Navigation */}
        <div className="flex flex-col items-center mt-6 space-y-2">
          <Avatar className="h-16 w-16">
            <AvatarImage src={ownerInfo.avatarUrl} alt="User" />
            <AvatarFallback>{ownerInfo.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          {sidebarOpen && (
            <div className="text-center">
              <p className="text-sm font-medium">{ownerInfo.name || "Guest"}</p>
              <p className="text-xs text-gray-400">Pet Boarding</p>
            </div>
          )}
        </div>
        <nav className="mt-6 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.name}
              variant={activeSection === item.section ? "secondary" : "ghost"}
              className={`w-full flex items-center ${sidebarOpen ? "justify-start pl-3" : "justify-center"} text-white hover:bg-gray-700`}
              onClick={() => setActiveSection(item.section)}
            >
              <item.icon className="h-5 w-5" />
              {sidebarOpen && <span className="ml-2">{item.name}</span>}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="w-full mt-6 flex items-center justify-start text-red-400 hover:bg-gray-700 hover:text-red-300"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-56" : "ml-20"} overflow-auto bg-gray-900`}>
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <h1 className="text-xl font-bold text-white">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
        </header>
        <main className="p-4">{renderSection()}</main>
      </div>
    </div>
  )
}