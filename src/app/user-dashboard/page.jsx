"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { appwriteConfig, getAccount } from "@/lib/appwrite";
import { fetchUserAndPetInfo, getCurrentUser, signOut } from "@/lib/appwrite";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PawPrint,
  MenuIcon,
  CalendarIcon,
  LogOut,
  MessageCircle,
  BellIcon,
  FileText,
  X,
} from "lucide-react";
import { Client, Databases, Storage, Query } from "appwrite";
import { useAuthUserStore } from "@/store/user";
import Appointment from "./appointment/page";
import Notification from "./notification/page";
import Feedback from "./feedback/page";
import MyPets from "./MyPets";
import PetRecord from "./petRecord/page";

export default function PetCareDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const clearAuthUser = useAuthUserStore((state) => state.clearAuthUser);
  const [ownerInfo, setOwnerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
    avatarUrl: "/placeholder.svg",
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [pets, setPets] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { authUser } = useAuthUserStore();

  const client = useMemo(() => {
    const c = new Client();
    c.setEndpoint(appwriteConfig.endpoint)
     .setProject(appwriteConfig.projectId);
    return c;
  }, []);

  const databases = useMemo(() => {
    return new Databases(client);
  }, [client]);

  const storage = useMemo(() => {
    return new Storage(client);
  }, [client]);

  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      clearAuthUser();
      router.push("/");
      toast.success("Logout successful!");
    } catch (error) {
      console.error("Failed to log out:", error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleEditOwner = () => setIsEditingOwner((prev) => !prev);

  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    setOwnerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (file) => {
    try {
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
      let avatarUrl = ownerInfo.avatarUrl;

      if (newAvatarFile) {
        const avatarId = await handleAvatarUpload(newAvatarFile);
        avatarUrl = `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.bucketId}/files/${avatarId}/view?project=${appwriteConfig.projectId}`;
      }

      const updatedData = {
        name: ownerInfo.name,
        phone: ownerInfo.phone,
        avatar: avatarUrl,
      };

      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId,
        updatedData
      );

      setOwnerInfo((prev) => ({
        ...prev,
        avatarUrl: avatarUrl,
      }));

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
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();

        if (currentUser && currentUser.$id) {
          setUserId(currentUser.$id);

          // Fetch the user document from the database to get the latest data
          const userDoc = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            currentUser.$id
          );

          // Update owner info with database values, falling back to current user data
          setOwnerInfo({
            name: userDoc.name || currentUser.name || "",
            email: userDoc.email || currentUser.email || "",
            phone: userDoc.phone || currentUser.phone || "",
            status: userDoc.status || currentUser.status || "",
            // Prioritize the avatar from database, then currentUser, then fallback
            avatarUrl:
              userDoc.avatar || currentUser.avatar || "/placeholder.svg",
          });
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Auth check error: ", err);
        router.push("/");
      }
    };

    checkAuth();
  }, [router, databases]);

  useEffect(() => {
    if (!userId || !authUser) return;

    const loadData = async () => {
      try {
        // First fetch the user document directly
        const userDoc = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          userId
        );

        // Update owner info immediately with database values
        setOwnerInfo((prev) => ({
          ...prev,
          name: userDoc.name || prev.name,
          email: userDoc.email || prev.email,
          phone: userDoc.phone || prev.phone,
          status: userDoc.status || prev.status,
          // Explicitly use the avatar from database first
          avatarUrl: userDoc.avatar || prev.avatarUrl,
        }));

        const ownerId = authUser.accountId;

        // Then fetch pets data
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.petCollectionId,
          [Query.equal("ownerId", ownerId), Query.orderDesc("$createdAt")]
        );

        const uniquePets = response.documents.reduce((acc, current) => {
          const existingPet = acc.find(
            (pet) => pet.petName === current.petName
          );
          if (!existingPet) {
            acc.push({
              ...current,
              id: current.$id,
            });
          } else {
            if (
              current.petServices &&
              !existingPet.petServices.includes(current.petServices)
            ) {
              existingPet.petServices = Array.isArray(existingPet.petServices)
                ? [...existingPet.petServices, current.petServices]
                : [existingPet.petServices, current.petServices];
            }
          }
          return acc;
        }, []);

        setPets(uniquePets);

        // Additional user info fetch if needed
        const { user } = await fetchUserAndPetInfo(userId);
        if (user.avatar) {
          // Only update if there's an avatar
          setOwnerInfo((prev) => ({
            ...prev,
            avatarUrl: user.avatar,
          }));
        }
      } catch (error) {
        setError("Failed to load user or pet data.");
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, authUser, databases]);

  const navItems = [
    { icon: PawPrint, title: "My Pet's", id: "overview" },
    { icon: CalendarIcon, title: "Appointments", id: "appointment" },
    { icon: FileText, title: "Pet Record", id: "petRecord" },
  ];

  const PawPrintLoader = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-[#FAF5E6]">
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
          }}
        >
          <PawPrint className="h-24 w-24 text-black" />
        </motion.div>
      </div>
      <p className="mt-4 text-lg font-medium text-black animate-pulse">
        Loading your pet paradise...
      </p>
    </div>
  );

  if (loading) return <PawPrintLoader />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-[#FAF5E6] text-white">
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FAF5E6] relative">
      {isMobileView && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static
          z-30 md:z-auto
          bg-white shadow-lg
          ${sidebarOpen ? "w-64" : isMobileView ? "w-0" : "w-20"}
          min-h-screen
          transition-all duration-300
          ${
            isMobileView && !sidebarOpen ? "-translate-x-full" : "translate-x-0"
          }
        `}
      >
        {isMobileView && sidebarOpen && (
          <Button
            variant="ghost"
            className="absolute top-4 right-4 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5 text-[#2D2C2E]" />
          </Button>
        )}

        {!isMobileView && (
          <Button
            variant="ghost"
            className="absolute top-4 right-4 hidden md:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MenuIcon className="h-5 w-5 text-[#2D2C2E]" />
          </Button>
        )}

        <div
          className={`flex flex-col items-center mt-16 space-y-4 ${
            !sidebarOpen && isMobileView ? "hidden" : ""
          }`}
        >
          <div className="relative">
            <Avatar
              className="h-16 w-16 md:h-20 md:w-20 border-4 border-[#FBBD0D] cursor-pointer hover:border-[#FD1F4A] transition-colors duration-300"
              onClick={toggleEditOwner}
            >
              <AvatarImage src={ownerInfo.avatarUrl} alt="User" />
              <AvatarFallback className="bg-[#FBBD0D] text-[#2D2C2E]">
                {ownerInfo.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            {isEditingOwner && (
              <input
                type="file"
                accept="image/*"
                className="absolute bottom-0 left-0 w-full text-xs bg-white border border-[#FBBD0D] rounded-md p-1"
                onChange={(e) => setNewAvatarFile(e.target.files[0])}
              />
            )}
          </div>

          {sidebarOpen && (
            <div className="text-center space-y-2 w-full px-4">
              {isEditingOwner ? (
                <>
                  <input
                    name="name"
                    value={ownerInfo.name}
                    onChange={handleOwnerChange}
                    placeholder="Name"
                    className="w-full px-3 py-2 border border-[#FBBD0D] rounded-md text-[#2D2C2E] text-sm focus:ring-2 focus:ring-[#FD1F4A] focus:border-transparent"
                  />
                  <input
                    name="email"
                    value={ownerInfo.email}
                    readOnly
                    placeholder="Email"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-400 text-sm cursor-not-allowed bg-gray-50"
                  />
                  <input
                    name="phone"
                    value={ownerInfo.phone}
                    onChange={handleOwnerChange}
                    placeholder="Phone"
                    className="w-full px-3 py-2 border border-[#FBBD0D] rounded-md text-[#2D2C2E] text-sm focus:ring-2 focus:ring-[#FD1F4A] focus:border-transparent"
                  />
                  <Button
                    onClick={handleSaveOwner}
                    className="w-full bg-[#FD1F4A] hover:bg-[#FD1F4A]/90 text-white"
                  >
                    Save Profile
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-[#2D2C2E]">
                    {ownerInfo.name || "Guest"}
                  </p>
                  <p className="text-sm text-[#2D2C2E]">
                    <span className="font-medium">Email:</span>{" "}
                    {ownerInfo.email}
                  </p>
                  <p className="text-sm text-[#2D2C2E]">
                    <span className="font-medium">Phone:</span>{" "}
                    {ownerInfo.phone}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <nav
          className={`space-y-2 border-t border-[#FBBD0D]/20 pt-4 mt-4 px-2 ${
            !sidebarOpen && isMobileView ? "hidden" : ""
          }`}
        >
          {navItems.map(({ icon: Icon, title, id }) => (
            <Button
              key={id}
              variant={activeSection === id ? "secondary" : "ghost"}
              className={`w-full justify-start text-sm md:text-base ${
                !sidebarOpen && "px-2"
              } ${
                activeSection === id
                  ? "bg-[#FBBD0D] text-[#2D2C2E]"
                  : "text-[#2D2C2E] hover:bg-[#FBBD0D]/10"
              }`}
              onClick={() => {
                setActiveSection(id);
                if (isMobileView) setSidebarOpen(false);
              }}
            >
              <Icon className={`h-5 w-5 ${sidebarOpen && "mr-2"}`} />
              {sidebarOpen && <span>{title}</span>}
            </Button>
          ))}
        </nav>

        <div
          className={`mt-auto px-2 pb-4 ${
            !sidebarOpen && isMobileView ? "hidden" : ""
          }`}
        >
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              !sidebarOpen && "px-2"
            } text-[#FD1F4A] hover:bg-[#FD1F4A]/10`}
            onClick={handleLogout}
          >
            <LogOut className={`h-5 w-5 ${sidebarOpen && "mr-2"}`} />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
        <div className="flex items-center justify-between mb-4 md:hidden">
          <Button
            variant="ghost"
            className="text-[#2D2C2E]"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            className="text-[#2D2C2E]"
            onClick={() => setShowNotifications(true)}
          >
            <BellIcon className="h-6 w-6" />
          </Button>
        </div>

        <div className="max-w-7xl mx-auto">
          {showNotifications ? (
            <Notification onClose={() => setShowNotifications(false)} />
          ) : (
            <>
              {activeSection === "overview" && (
                <MyPets
                  pets={pets}
                  setPets={setPets}
                  databases={databases}
                  storage={storage}
                />
              )}
              {activeSection === "appointment" && <Appointment />}
              {activeSection === "notification" && <Notification />}
              {activeSection === "feedback" && <Feedback />}
              {activeSection === "petRecord" && <PetRecord />}
            </>
          )}
        </div>
      </main>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        closeOnClick
      />
    </div>
  );
}
