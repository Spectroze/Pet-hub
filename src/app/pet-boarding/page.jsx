"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getCurrentUser,
  fetchUserAndPetInfo,
  appwriteConfig,
  signOut,
} from "@/lib/appwrite";
import { Client, Databases, Storage, Query } from "appwrite";
import {
  Bell,
  Calendar,
  Home,
  PawPrint,
  BedDouble,
  LogOut,
  MessageCircle,
  MenuIcon,
  Edit,
  User,
  Scissors,
  Dog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import AppointmentCalendar from "../pet-boarding/appointments/page";
import PetRecords from "../pet-boarding/records/page";
import RoomManagement from "../pet-boarding/room/page";
import Notifications from "../pet-boarding/notifications/page";
import Feedback from "./feedback/page";
import { Input } from "@/components/ui/input";
import Analytics from "./analytics";
import Owners from "./owner/page";
import { useAuthUserStore } from "@/store/user";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const toggleEditOwner = () => setIsEditingOwner((prev) => !prev);
  const [notificationCount, setNotificationCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const clearAuthUser = useAuthUserStore((state) => state.clearAuthUser);
  const [userServices, setUserServices] = useState([]);
  const setAuthUser = useAuthUserStore((state) => state.setAuthUser);
  const [isMobile, setIsMobile] = useState(false);

  const client = new Client();
  client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

  const databases = new Databases(client);
  const storage = new Storage(client);

  const [ownerInfo, setOwnerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    avatarUrl: "/placeholder.svg",
    role: "",
  });

  const fetchNotifications = async () => {
    try {
      if (!userId) {
        console.warn("User ID is not available for fetching notifications.");
        return;
      }
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId,
        [Query.equal("status_reading", "unread")]
      );
      setNotificationCount(response.total);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotificationCount(0);
    }
  };

  const verifyUserAndCollection = async () => {
    try {
      console.log("User ID to verify:", userId);
      await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId
      );
      console.log("Collection Exists:", true);
    } catch (error) {
      console.error("Error verifying user and collection:", error);
      console.log("Collection Exists:", false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      verifyUserAndCollection();
    }
  }, [userId]);

  useEffect(() => {
    const fetchInitialNotifications = async () => {
      await fetchNotifications();
    };

    fetchInitialNotifications();

    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.petCollectionId}.documents`,
      (response) => {
        console.log("Real-time response:", response);
        if (
          response.events.includes("databases.*.documents.*.create") ||
          response.events.includes("databases.*.documents.*.update")
        ) {
          fetchNotifications();
        }
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    setOwnerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (file) => {
    try {
      if (!appwriteConfig.bucketId) {
        throw new Error("Bucket ID is not defined in appwriteConfig.");
      }

      const response = await storage.createFile(
        appwriteConfig.bucketId,
        "unique()",
        file
      );

      return response.$id;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar.");
      throw error;
    }
  };

  const handleSaveOwner = async () => {
    const toastId = toast.loading("Updating profile...");
    try {
      let avatarUrl = null;

      if (newAvatarFile) {
        const avatarId = await handleAvatarUpload(newAvatarFile);
        avatarUrl = `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.bucketId}/files/${avatarId}/view?project=${appwriteConfig.projectId}`;
      }

      const updatedData = {
        name: ownerInfo.name,
        phone: ownerInfo.phone,
      };

      if (avatarUrl) {
        updatedData.avatar = avatarUrl;
      }

      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId,
        updatedData
      );

      if (avatarUrl) {
        setOwnerInfo((prev) => ({ ...prev, avatarUrl }));
      }

      setIsEditingOwner(false);
      setNewAvatarFile(null);
      toast.update(toastId, {
        render: "Profile updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error updating owner profile:", error);
      toast.update(toastId, {
        render: "Failed to update profile. Try again!",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUserId(currentUser.$id);
          const { user, pet } = await fetchUserAndPetInfo(currentUser.$id);

          setOwnerInfo({
            name: user?.name || "Guest",
            phone: user?.phone || "N/A",
            email: user?.email || "N/A",
            avatarUrl: user?.avatar || "/placeholder.svg",
            role: user?.role || "",
          });

          // Determine user services based on the role
          const services = [];
          if (user?.role) {
            if (user.role.includes("veterinary")) services.push("Clinic");
            if (user.role.includes("grooming")) services.push("grooming");
            if (user.role.includes("training")) services.push("Pet Training");
            if (user.role.includes("boarding")) services.push("Pet Boarding");
          }
          setUserServices(services);

          // Update the auth user store with the current user's services
          setAuthUser({ ...user, services });
        } else {
          console.error("No current user found");
          toast.error("Failed to load user data. Please log in again.");
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to load user or pet data:", error);
        toast.error("Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <Analytics />;
      case "appointments":
        return <AppointmentCalendar />;
      case "petRecords":
        return <PetRecords />;
      case "owner":
        return <Owners />;
      case "rooms":
        return <RoomManagement />;
      case "notifications":
        return <Notifications />;
      case "feedback":
        return <Feedback />;
      default:
        return <Analytics />;
    }
  };

  const navigationItems = [
    { id: "overview", name: "Overview", icon: Home },
    { id: "appointments", name: "Appointments", icon: Calendar },
    { id: "petRecords", name: "Pet Records", icon: PawPrint },
    { id: "owner", name: "Owner", icon: User },
    { id: "feedback", name: "Feedback", icon: MessageCircle },
    ...(userServices.includes("Pet Boarding")
      ? [{ id: "rooms", name: "Rooms", icon: BedDouble }]
      : []),
    ...(userServices.includes("grooming")
      ? [{ id: "grooming", name: "Grooming", icon: Scissors }]
      : []),
    ...(userServices.includes("Pet Training")
      ? [{ id: "training", name: "Training", icon: Dog }]
      : []),
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      clearAuthUser();
      router.push("/");
      toast.success("Logout successful!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Failed to log out:", error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-[#FAF5E6] text-gray-900 relative">
      <ToastContainer />

      {/* Sidebar with overlay for mobile */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed md:relative md:translate-x-0 z-30 bg-white border-r h-full transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <Button
          variant="ghost"
          className={`absolute top-4 right-4 transition-all ${
            sidebarOpen ? "mr-2" : "ml-0"
          } text-gray-600 hover:bg-gray-100`}
          onClick={toggleSidebar}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>

        <div className="flex flex-col items-center mt-16 space-y-2">
          <div className="relative">
            <Avatar
              className="h-20 w-20 border-2 border-yellow-400 cursor-pointer"
              onClick={toggleEditOwner}
            >
              <AvatarImage src={ownerInfo.avatarUrl} alt="User" />
              <AvatarFallback>{ownerInfo.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            {isEditingOwner && (
              <Input
                type="file"
                accept="image/*"
                className="absolute bottom-0 left-0 text-xs text-gray-100 bg-gray-700 rounded-md"
                onChange={(e) => setNewAvatarFile(e.target.files[0])}
              />
            )}
          </div>

          {sidebarOpen && (
            <div className="text-center space-y-2">
              {isEditingOwner ? (
                <>
                  <Input
                    name="name"
                    value={ownerInfo.name}
                    onChange={handleOwnerChange}
                    placeholder="Name"
                    className="mt-2 bg-gray-700 text-white"
                  />
                  <Input
                    name="email"
                    value={ownerInfo.email}
                    readOnly
                    placeholder="Email"
                    className="mt-2 bg-gray-700 text-white cursor-not-allowed"
                  />
                  <Input
                    name="phone"
                    value={ownerInfo.phone}
                    onChange={handleOwnerChange}
                    placeholder="Phone"
                    className="mt-2 bg-gray-700 text-white"
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
                <>
                  <p className="text-sm font-medium text-gray-900">
                    {ownerInfo.name || "Guest"}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <nav className="space-y-2 border-t border-gray-200 pt-4 mt-4">
          {navigationItems.map(({ id, name, icon: Icon }) => (
            <Button
              key={id}
              variant={activeSection === id ? "secondary" : "ghost"}
              className={`w-full justify-start relative ${
                !sidebarOpen && "px-2"
              } ${
                activeSection === id
                  ? "bg-yellow-400 text-gray-800"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
              onClick={() => setActiveSection(id)}
            >
              <div className="relative inline-flex items-center">
                <Icon className={`h-5 w-5 ${sidebarOpen ? "mr-2" : ""}`} />
                {id === "notifications" && notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {notificationCount}
                  </span>
                )}
              </div>
              {sidebarOpen && <span>{name}</span>}
            </Button>
          ))}
        </nav>
        <Button
          variant="ghost"
          className={`w-full mt-auto justify-start ${
            !sidebarOpen && "px-2"
          } text-red-500 hover:bg-gray-100`}
          onClick={handleLogout}
        >
          <LogOut className={`h-5 w-5 ${sidebarOpen && "mr-2"}`} />
          {sidebarOpen && <span>Logout</span>}
        </Button>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="md:hidden mr-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-800">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
          </div>

          <Button
            variant="ghost"
            className="relative"
            onClick={() => setActiveSection("notifications")}
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {notificationCount}
              </span>
            )}
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-4">{renderSection()}</main>
      </div>
    </div>
  );
}
