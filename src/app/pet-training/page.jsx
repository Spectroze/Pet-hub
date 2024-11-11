"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import AppointmentCalendar from "../pet-training/appointments/page";
import TrainingNotifications from "../pet-training/notifications/page";
import Feedback from "../pet-training/feedback/page";
import Archived from "../pet-training/archived/page";
import {
  Menu,
  Home,
  Calendar as CalendarIcon,
  MessageCircle,
  Bell,
  Archive,
  LogOut,
  TrendingUp,
  Users,
  PawPrint,
  DollarSign,
  Star,
  ArrowUp,
  ArrowDown,
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
  { name: "Feedback", icon: MessageCircle },
  { name: "Notifications", icon: Bell },
  { name: "Archived", icon: Archive },
];

// Mock data for charts
const monthlyRevenueData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4500 },
  { month: "May", revenue: 5500 },
  { month: "Jun", revenue: 6000 },
];

const trainingProgressData = [
  { name: "Week 1", progress: 20 },
  { name: "Week 2", progress: 40 },
  { name: "Week 3", progress: 55 },
  { name: "Week 4", progress: 70 },
  { name: "Week 5", progress: 85 },
  { name: "Week 6", progress: 95 },
];

const petTypeData = [
  { name: "Dogs", value: 60 },
  { name: "Cats", value: 25 },
  { name: "Birds", value: 10 },
  { name: "Others", value: 5 },
];

const clientSatisfactionData = [
  { month: "Jan", satisfaction: 4.2 },
  { month: "Feb", satisfaction: 4.3 },
  { month: "Mar", satisfaction: 4.5 },
  { month: "Apr", satisfaction: 4.4 },
  { month: "May", satisfaction: 4.6 },
  { month: "Jun", satisfaction: 4.7 },
];

const weeklyAppointmentsData = [
  { day: "Mon", appointments: 8 },
  { day: "Tue", appointments: 10 },
  { day: "Wed", appointments: 12 },
  { day: "Thu", appointments: 9 },
  { day: "Fri", appointments: 11 },
  { day: "Sat", appointments: 7 },
  { day: "Sun", appointments: 5 },
];

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--muted))",
];

function StatCard({ title, value, icon: Icon, change }) {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          {change > 0 ? (
            <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
          ) : (
            <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
          )}
          {Math.abs(change)}% from last month
        </p>
      </CardContent>
    </Card>
  );
}

function Overview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Appointments"
          value="24"
          icon={CalendarIcon}
          change={10}
        />
        <StatCard title="Total Pets" value="145" icon={PawPrint} change={5} />
        <StatCard title="Total Owners" value="98" icon={Users} change={2} />
        <StatCard
          title="Revenue"
          value="$12,345"
          icon={DollarSign}
          change={15}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-card">
          <CardHeader>
            <CardTitle>Pet Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                petTypes: {
                  label: "Pet Types",
                  color: "hsl(var(--muted))",
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
                    fill="hsl(var(--muted))"
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card">
          <CardHeader>
            <CardTitle>Training Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trainingProgressData.map((week) => (
                <div key={week.name} className="flex items-center">
                  <div className="w-24 text-sm">{week.name}</div>
                  <Progress value={week.progress} className="flex-1" />
                  <div className="w-12 text-right text-sm">
                    {week.progress}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-card">
          <CardHeader>
            <CardTitle>Client Satisfaction</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                satisfaction: {
                  label: "Satisfaction",
                  color: "hsl(var(--accent))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clientSatisfactionData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    domain={[0, 5]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="satisfaction"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card">
          <CardHeader>
            <CardTitle>Weekly Appointments</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                appointments: {
                  label: "Appointments",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAppointmentsData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="appointments" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-card">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-center">
                <Badge variant="secondary" className="mr-2">
                  New
                </Badge>
                <span>Max (Golden Retriever) completed basic obedience</span>
              </li>
              <li className="flex items-center">
                <Badge variant="secondary" className="mr-2">
                  Update
                </Badge>
                <span>Luna (Cat) started intermediate training</span>
              </li>
              <li className="flex items-center">
                <Badge variant="secondary" className="mr-2">
                  Feedback
                </Badge>
                <span>Positive review received for agility class</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PetTrainingDashboard() {
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
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`bg-card ${
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
              <p className="text-xs text-muted-foreground">
                Pet Training Center
              </p>
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
            className="w-full mt-8 flex items-center justify-start text-destructive"
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
        {activeTab === "appointments" && <AppointmentCalendar />}
        {activeTab === "feedback" && <Feedback />}
        {activeTab === "notifications" && <TrainingNotifications />}
        {activeTab === "archived" && <Archived />}
      </main>
    </div>
  );
}
