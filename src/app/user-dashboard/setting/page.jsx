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
  const clearAuthUser = useAuthUserStore((state) => state.clearAuthUser); // Access Zustand store action

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(); // Call signOut to handle Appwrite logout
      clearAuthUser(); // Clear Zustand store
      router.push("/"); // Redirect to login page
    } catch (error) {
      console.error("Failed to log out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 shadow-xl mt-36">
      <CardHeader className="text-center py-10">
        <CardTitle className="text-4xl font-bold flex items-center justify-center gap-4">
          <SettingsIcon className="w-10 h-10" />
          Settings
        </CardTitle>
        <CardDescription className="text-xl mt-4">
          Manage your account and application preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 px-8">
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
      <CardFooter className="flex justify-center py-8">
        <Button
          variant="destructive"
          size="lg"
          className="w-full max-w-md text-lg"
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
    <div className="p-8 bg-card rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
      <div className="flex items-center mb-6">
        <div className="bg-primary/10 p-3 rounded-full mr-4">{icon}</div>
        <h3 className="font-semibold text-2xl">{title}</h3>
      </div>
      <p className="text-lg text-muted-foreground mb-6">{description}</p>
      <Button
        variant="outline"
        size="lg"
        className="w-full hover:bg-primary hover:text-primary-foreground text-lg"
      >
        {buttonText}
      </Button>
    </div>
  );
}
