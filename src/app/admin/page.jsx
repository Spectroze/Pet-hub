"use client";

import React, { useState } from "react";
import UserManagement from "../admin/users/page";
import CreateAccountForm from "../admin/createAccount/page";
import Analytics from "../admin/analytics/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Users,
  Calendar,
  PieChart,
  UserPlus,
  Menu,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/store/auth";

export default function PetcareAdminDashboard() {
  useRequireAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const router = useRouter();

  const sidebarItems = [
    { id: "overview", icon: BarChart, label: "Overview" },
    { id: "users", icon: Users, label: "User Management" },
    { id: "createAccount", icon: UserPlus, label: "Create Account" },
    { id: "analytics", icon: PieChart, label: "Analytics" },
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
        // Optionally show an error message to the user
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-gray-400 ${
          isSidebarOpen ? "w-64" : "w-20"
        } min-h-screen p-4 transition-all duration-300 ease-in-out relative`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Toggle */}
          <div className="absolute top-4 right-4">
            <Button variant="outline" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-12">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className="w-full justify-start mb-2"
                onClick={() => {
                  if (item.id === "logout") {
                    handleLogout();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {isSidebarOpen && item.label}{" "}
                {/* Show label only if sidebar is open */}
              </Button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Pets
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5,678</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Upcoming Appointments
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Site Activity
                  </CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12.5%</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "users" && <UserManagement />}
        {activeTab === "createAccount" && <CreateAccountForm />}
        {activeTab === "analytics" && <Analytics />}
      </div>
    </div>
  );
}
