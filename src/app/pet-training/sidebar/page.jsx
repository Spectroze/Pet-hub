"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu,
  LogOut,
  PawPrint,
  Home,
  Calendar,
  Clipboard,
  Bell,
  MessageCircle,
  Archive,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Mock user data for the avatar
const ownerInfo = {
  name: "John Doe",
  avatarUrl: "/images/avatar-placeholder.png", // Adjust path as needed
};

const Sidebar = ({
  activeSection,
  setActiveSection,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuItems = [
    { name: "Overview", icon: Home, section: "overview" },
    { name: "Appointments", icon: Calendar, section: "appointments" },
    { name: "Pet Records", icon: Clipboard, section: "record" },
    { name: "Feedback", icon: MessageCircle, section: "feedback" },
    { name: "Notifications", icon: Bell, section: "notifications" },
    { name: "Archived", icon: Archive, section: "archived" },
    { name: "Log Out", icon: LogOut, section: "logout" },
  ];

  const handleLogout = () => {
    toast.success("Successfully logged out!");
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-gray-900 text-white transition-all duration-300 ease-in-out",
        isMobile
          ? sidebarOpen
            ? "w-64"
            : "w-20"
          : sidebarOpen
          ? "w-64"
          : "w-20"
      )}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <PawPrint className="h-6 w-6" />
          <span className={cn("font-bold", sidebarOpen ? "block" : "hidden")}>
            Pet Paradise
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(isMobile && !sidebarOpen && "hidden")}
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <div className="flex flex-col space-y-1">
              <span className="block h-1 w-6 bg-white" />
              <span className="block h-1 w-6 bg-white" />
              <span className="block h-1 w-6 bg-white" />
            </div>
          )}
        </Button>
      </div>

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

      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.section}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  activeSection === item.section && "bg-gray-800",
                  !sidebarOpen && "px-2"
                )}
                onClick={() => {
                  if (item.section === "logout") {
                    handleLogout();
                  } else {
                    setActiveSection(item.section);
                  }
                }}
              >
                <item.icon className={cn("h-5 w-5", sidebarOpen && "mr-2")} />
                <span className={cn("ml-2", sidebarOpen ? "block" : "hidden")}>
                  {item.name}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
