'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Appointments from "./appointment/page"
import Pets from "./pets/page"
import Feedback from "./feedback/page"
import Owners from "./owner/page"

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
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const ownerInfo = {
  name: "John Doe",
  avatarUrl: "/images/avatar-placeholder.png",
}

const navigationItems = [
  { name: "Overview", icon: Home },
  { name: "Appointments", icon: CalendarIcon },
  { name: "Pets", icon: PawPrint },
  { name: "Owners", icon: Users },
  { name: "Feedback", icon: MessageCircle },

]

// Mock data for the analytics
const analyticsData = {
  totalAppointments: 1250,
  totalPets: 450,
  totalOwners: 890,
  totalRevenue: 78500,
}

// Updated mock data for the monthly analytics chart (removed petsBoarding)
const monthlyData = [
  { month: "Jan", appointments: 95, petGrooming: 50, veterinary: 80, revenue: 5200 },
  { month: "Feb", appointments: 100, petGrooming: 55, veterinary: 85, revenue: 5800 },
  { month: "Mar", appointments: 120, petGrooming: 60, veterinary: 90, revenue: 6500 },
  { month: "Apr", appointments: 110, petGrooming: 58, veterinary: 88, revenue: 6200 },
  { month: "May", appointments: 130, petGrooming: 65, veterinary: 95, revenue: 7000 },
  { month: "Jun", appointments: 140, petGrooming: 70, veterinary: 100, revenue: 7500 },
]

// Mock data for revenue analytics (removed boarding)
const revenueData = [
  { month: "Jan", checkups: 2000, surgeries: 1500, grooming: 700 },
  { month: "Feb", checkups: 2200, surgeries: 1700, grooming: 800 },
  { month: "Mar", checkups: 2500, surgeries: 2000, grooming: 800 },
  { month: "Apr", checkups: 2300, surgeries: 1800, grooming: 800 },
  { month: "May", checkups: 2700, surgeries: 2200, grooming: 700 },
  { month: "Jun", checkups: 2900, surgeries: 2400, grooming: 700 },
]

function AnalyticsCard({ title, value, icon: Icon }) {
  return (
    <Card className="bg-gray-800 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-200">{title}</CardTitle>
        <Icon className="h-4 w-4 text-[#FF6B6B]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
      </CardContent>
    </Card>
  )
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
  )
}

export default function Component() {
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
      <aside
        className={`bg-gray-800 ${
          sidebarOpen ? "w-64" : "w-20"
        } min-h-screen p-4 transition-all duration-300 ease-in-out relative`}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="flex flex-col items-center mt-10 space-y-2">
          <Avatar className="h-20 w-20">
            <AvatarImage src={ownerInfo.avatarUrl} alt="User avatar" />
            <AvatarFallback>{ownerInfo.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          {sidebarOpen && (
            <div className="text-center">
              <p className="text-sm font-medium text-gray-200">{ownerInfo.name || "Guest"}</p>
              <p className="text-xs text-gray-400">Clinic Name</p>
            </div>
          )}
        </div>

        <nav className="mt-8">
          {navigationItems.map((item) => (
            <Button
              key={item.name}
              variant={activeTab === item.name.toLowerCase() ? "secondary" : "ghost"}
              className={`w-full justify-start mb-2 ${
                sidebarOpen ? "pl-4" : "justify-center"
              } hover:bg-gray-700 text-gray-200`}
              onClick={() => setActiveTab(item.name.toLowerCase())}
            >
              <item.icon className="mr-2 h-4 w-4 text-[#FF6B6B]" />
              {sidebarOpen && <span>{item.name}</span>}
            </Button>
          ))}

          <Button
            variant="ghost"
            className="w-full mt-8 flex items-center justify-start text-red-400 hover:bg-gray-700 hover:text-red-300"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </nav>
      </aside>

      <main className="flex-1 p-4 overflow-auto bg-gray-900">
        {activeTab === "overview" && <Analytics />}
        {activeTab === "appointments" && <Appointments />}
        {activeTab === "pets" && <Pets />}
        {activeTab === "owners" && <Owners />}
        {activeTab === "feedback" && <Feedback />}
  
      </main>
    </div>
  )
}