"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  UserIcon,
  BellIcon,
  ShieldIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/appwrite";
import { useAuthUserStore } from "@/store/user";

export default function Setting() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const clearAuthUser = useAuthUserStore((state) => state.clearAuthUser);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      clearAuthUser();
      router.push("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 shadow-[0_0_20px_rgba(66,153,225,0.5)] text-gray-100 mt-36">
      <CardHeader className="text-center py-10 bg-gray-800 rounded-t-xl">
        <CardTitle className="text-4xl font-bold flex items-center justify-center gap-4 text-blue-300">
          <SettingsIcon className="w-10 h-10" />
          Settings
        </CardTitle>
        <CardDescription className="text-xl mt-4 text-gray-300">
          Manage your account and application preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 px-8 py-10 bg-gray-900">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <SettingItem
            icon={<UserIcon className="w-8 h-8" />}
            title="Account Settings"
            description="Update your personal information and password"
            buttonText="Edit Account"
          />
          <SettingItem
            icon={<BellIcon className="w-8 h-8" />}
            title="Notification Preferences"
            description="Set your notification preferences for various alerts"
            buttonText="Edit Notifications"
          />
          <SettingItem
            icon={<ShieldIcon className="w-8 h-8" />}
            title="Privacy Settings"
            description="Manage your privacy settings and data sharing options"
            buttonText="Edit Privacy"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-center py-8 bg-gray-800 rounded-b-xl">
        <Button
          variant="destructive"
          size="lg"
          className="w-full max-w-md text-lg bg-red-600 hover:bg-red-700 text-white"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOutIcon className="w-6 h-6 mr-3" />
          {isLoggingOut ? "Logging out..." : "Log Out"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function SettingItem({ icon, title, description, buttonText }) {
  return (
    <div className="p-8 bg-gray-800 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105">
      <div className="flex items-center mb-6">
        <div className="bg-blue-500/20 p-3 rounded-full mr-4 text-blue-300">
          {icon}
        </div>
        <h3 className="font-semibold text-2xl text-blue-200">{title}</h3>
      </div>
      <p className="text-lg text-gray-400 mb-6">{description}</p>
      <Button
        variant="outline"
        size="lg"
        className="w-full bg-gray-700 text-gray-200 hover:bg-blue-600 hover:text-white border-gray-600 text-lg"
      >
        {buttonText}
      </Button>
    </div>
  );
}
