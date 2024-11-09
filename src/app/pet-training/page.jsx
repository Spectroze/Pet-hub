"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

import AppointmentCalendar from "../pet-training/appointments/page"
import TrainingNotifications from "../pet-training/notifications/page"
import Feedback from "../pet-training/feedback/page"
import Archived from "../pet-training/archived/page"
import Pets from "../pet-training/pets/page"

import {
  Menu,
  Home,
  Calendar as CalendarIcon,
  PawPrint,
  Users,
  BarChart2,
  LogOut,
  MessageCircle,
  Bell,
  Archive,
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

// Mock user data for the avatar
const ownerInfo = {
  name: "John Doe",
  avatarUrl: "/images/avatar-placeholder.png",
}

// Navigation Items
const navigationItems = [
  { name: "Overview", icon: Home },
  { name: "Appointments", icon: CalendarIcon },
  { name: "Feedback", icon: MessageCircle },
  { name: "Pets", icon: PawPrint },
  { name: "Notifications", icon: Bell },
  { name: "Archived", icon: Archive },
]

function Overview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold text-gray-100">Total Appointments</h2>
        <p className="text-2xl text-gray-100">24</p>
        <p className="text-sm text-gray-400">+10% from last month</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold text-gray-100">Total Pets</h2>
        <p className="text-2xl text-gray-100">145</p>
        <p className="text-sm text-gray-400">+5% from last month</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold text-gray-100">Total Owners</h2>
        <p className="text-2xl text-gray-100">98</p>
        <p className="text-sm text-gray-400">+2% from last month</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold text-gray-100">Revenue</h2>
        <p className="text-2xl text-gray-100">$12,345</p>
        <p className="text-sm text-gray-400">+15% from last month</p>
      </div>
    </div>
  )
}

export default function PetTrainingDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const handleLogout = () => {
    toast.success("Successfully logged out!")
    setTimeout(() => {
      router.push("/")
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-gray-800 ${
          sidebarOpen ? "w-64" : "w-20"
        } min-h-screen p-4 transition-all duration-300 ease-in-out relative`}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="absolute top-4 right-4 bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-gray-100"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mt-10 space-y-2">
          <Avatar className="h-20 w-20 border-2 border-gray-700">
            <AvatarImage src={ownerInfo.avatarUrl} alt="User" />
            <AvatarFallback>{ownerInfo.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          {sidebarOpen && (
            <div className="text-center">
              <p className="text-sm font-medium text-gray-200">{ownerInfo.name || "Guest"}</p>
              <p className="text-xs text-gray-400">Pet Training</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          {navigationItems.map((item) => (
            <Button
              key={item.name}
              variant={activeTab === item.name.toLowerCase() ? "secondary" : "ghost"}
              className={`w-full justify-start mb-2 ${
                sidebarOpen ? "pl-4" : "justify-center"
              } ${
                activeTab === item.name.toLowerCase()
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-300 hover:bg-gray-700 hover:text-gray-100"
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
            className="w-full mt-8 flex items-center justify-start text-red-400 hover:bg-gray-700 hover:text-red-300"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {sidebarOpen && "Logout"}
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto bg-gray-900">
        {/* Dynamic Content */}
        {activeTab === "overview" && <Overview />}
        {activeTab === "appointments" && <AppointmentCalendar />}
        {activeTab === "feedback" && <Feedback />}
        {activeTab === "notifications" && <TrainingNotifications />}
        {activeTab === "archived" && <Archived />}
        {activeTab === "pets" && <Pets />}
      </main>
    </div>
  )
}