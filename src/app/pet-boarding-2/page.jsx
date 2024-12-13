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
import { Client, Databases, Query, Storage } from "appwrite";
import { useAuthUserStore } from "@/store/user";
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
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Analytics from "./analytiics";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import AppointmentCalendar from "./appointments/page";
import PetRecords from "./pets/page";
import RoomManagement from "./room/page";
import Notifications from "./notifications/page";
import Feedback from "./feedback/page";
import { Input } from "@/components/ui/input";
import Owners from "./owner/page";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const toggleEditOwner = () => setIsEditingOwner((prev) => !prev);
  const [userId, setUserId] = useState(null); // Declare userId state
  const [loading, setLoading] = useState(true); // Add loading state
  const [newAvatarFile, setNewAvatarFile] = useState(null); // New avatar file
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const clearAuthUser = useAuthUserStore((state) => state.clearAuthUser);

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
  });
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

  // notification
  const fetchNotifications = async () => {
    try {
      if (!userId) {
        console.warn("User ID is not available for fetching notifications.");
        return;
      }

      console.log("Attempting to fetch notifications for user ID:", userId);

      // Multiple query strategies to diagnose the issue
      const queryStrategies = [
        // Strategy 1: Simple ownerId match
        [Query.equal("ownerId", userId)],

        // Strategy 2: Partial match strategies
        [Query.startsWith("ownerId", userId.slice(0, 5))],

        // Strategy 3: Flexible matching
        [
          Query.equal("ownerId", userId),
          Query.or([
            Query.contains("status", ["Pending", "pending"]),
            Query.contains("petServices", ["Pet Boarding 2"]),
            Query.contains("petClinic", ["Clinic2"]),
          ]),
        ],
      ];

      for (const strategy of queryStrategies) {
        console.log(`Trying query strategy:`, strategy);

        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.petCollectionId,
          strategy
        );

        console.log(`Query result for strategy:`, {
          total: response.total,
          documentIds: response.documents.map((doc) => doc.$id),
          documents: response.documents.map((doc) => ({
            id: doc.$id,
            ownerId: doc.ownerId,
            petName: doc.petName,
            status: doc.status,
            petServices: doc.petServices,
          })),
        });

        if (response.total > 0) {
          setNotificationCount(response.total);
          return;
        }
      }

      console.warn("No documents found with any query strategy.");
      setNotificationCount(0);
    } catch (error) {
      console.error("Comprehensive error in fetchNotifications:", {
        message: error.message,
        errorCode: error.code,
        errorType: error.type,
        stack: error.stack,
      });
      setNotificationCount(0);
    }
  };

  const verifyUserAndCollection = async () => {
    try {
      console.log("User  ID to verify:", userId);

      // Try to list documents in the collection
      await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.petCollectionId
      );

      console.log("Collection Exists:", true);
      console.log(
        "Configured Pet Collection ID:",
        appwriteConfig.petCollectionId
      );
    } catch (error) {
      console.error("Error verifying user and collection:", error);
      console.log("Collection Exists:", false);
    }
  };
  // Modify your useEffect to include verification
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

    fetchInitialNotifications(); // Fetch notifications on component mount

    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.petCollectionId}.documents`,
      (response) => {
        console.log("Real-time response:", response);

        if (
          response.events.includes("databases.*.documents.*.create") ||
          response.events.includes("databases.*.documents.*.update")
        ) {
          fetchNotifications(); // Re-fetch notifications on document changes
        }
      }
    );

    return () => unsubscribe(); // Cleanup on unmount
  }, [userId]);

  const handleSaveOwner = async () => {
    const toastId = toast.loading("Updating profile...");
    try {
      let avatarUrl = null;

      // If a new avatar is selected, upload it and construct the full URL
      if (newAvatarFile) {
        const avatarId = await handleAvatarUpload(newAvatarFile);
        avatarUrl = `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.bucketId}/files/${avatarId}/view?project=${appwriteConfig.projectId}`;
      }

      const updatedData = {
        name: ownerInfo.name,
        phone: ownerInfo.phone,
      };

      // If a new avatar URL is available, include it in the update
      if (avatarUrl) {
        updatedData.avatar = avatarUrl;
      }

      await databases.updateDocument(
        appwriteConfig.databaseId, // Database ID
        appwriteConfig.userCollectionId, // User collection ID
        userId, // Current user ID
        updatedData
      );

      if (avatarUrl) {
        // Update the avatar URL locally for display
        setOwnerInfo((prev) => ({ ...prev, avatarUrl }));
      }

      setIsEditingOwner(false);
      setNewAvatarFile(null); // Reset new avatar file
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
          phone: user.phone || "N/A", // Default to "N/A" if phone is missing
          email: user.email || "N/A", // Fetch email if available
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

  const navItems = [
    { id: "overview", name: "Overview", icon: Home },
    { id: "appointments", name: "Appointments", icon: Calendar },
    { id: "petRecords", name: "Pet Records", icon: PawPrint },
    { id: "owner", name: "Owner", icon: User },
    { id: "rooms", name: "Rooms", icon: BedDouble },
    { id: "feedback", name: "Feedback", icon: MessageCircle },
    {
      id: "notifications",
      name: "Notifications",
      icon: Bell,
      hasBadge: true,
      badgeCount: notificationCount,
    },
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
    const fetchInitialNotifications = async () => {
      await fetchNotifications();
    };

    fetchInitialNotifications(); // Fetch notifications on component mount

    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.petCollectionId}.documents`,
      (response) => {
        console.log("Real-time response:", response);

        if (
          response.events.includes("databases.*.documents.*.create") ||
          response.events.includes("databases.*.documents.*.update")
        ) {
          fetchNotifications(); // Re-fetch notifications on document changes
        }
      }
    );

    return () => unsubscribe(); // Cleanup on unmount
  }, [userId]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <ToastContainer />
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
          <div className="relative">
            <Avatar
              className="h-20 w-20 border-2 border-gray-600 cursor-pointer"
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
                    className="mt-2 bg-gray-700 text-gray-100"
                  />
                  <Input
                    name="email"
                    value={ownerInfo.email}
                    readOnly
                    placeholder="Email"
                    className="mt-2 bg-gray-700 text-gray-400 cursor-not-allowed"
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
                <>
                  <p className="text-sm font-medium text-gray-200">
                    {ownerInfo.name || "Guest"}
                  </p>
                  <p className="text-xs text-gray-400">Pet Boarding 2</p>
                </>
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
