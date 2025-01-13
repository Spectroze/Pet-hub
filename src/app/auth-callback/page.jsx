"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { account, databases, appwriteConfig } from "@/lib/appwrite";
import { useAuthUserStore } from "@/store/user";
import { Query, ID } from "appwrite";
import { toast } from "react-toastify";

export default function AuthCallback() {
  const router = useRouter();
  const { setAuthUser } = useAuthUserStore();
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current session
        const session = await account.get();

        if (!session) {
          throw new Error("No session found");
        }

        // Check if user exists in database
        const existingUser = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          [Query.equal("accountId", session.$id)]
        );

        let userData;

        // Construct avatar URL properly
        const avatarUrl = session.prefs?.avatar
          ? `https://lh3.googleusercontent.com/a/${session.prefs.avatar}`
          : "https://ui-avatars.com/api/?name=" +
            encodeURIComponent(session.name);

        if (existingUser.total === 0) {
          // Create new user document
          userData = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
              accountId: session.$id,
              email: session.email,
              name: session.name,
              avatar: avatarUrl,
              role: "user",
              status: ["active"],
            }
          );
        } else {
          userData = existingUser.documents[0];

          // Update avatar if it has changed
          if (userData.avatar !== avatarUrl) {
            userData = await databases.updateDocument(
              appwriteConfig.databaseId,
              appwriteConfig.userCollectionId,
              userData.$id,
              {
                avatar: avatarUrl,
              }
            );
          }
        }

        // Set auth user in store
        setAuthUser({
          accountId: session.$id,
          email: session.email,
          name: session.name,
          role: userData.role,
          avatar: avatarUrl,
          status: userData.status,
        });

        // Add detailed debug logs
        console.log("Current user role:", userData.role);
        console.log("Role type:", typeof userData.role);
        console.log("Role length:", userData.role.length);
        console.log("Role with spaces visible:", JSON.stringify(userData.role));

        // Redirect based on role
        let redirectPath;
        const roleToCheck = userData.role.trim(); // Remove any extra spaces

        switch (roleToCheck) {
          case "admin":
            redirectPath = "/admin";
            break;
          case "Clinic 1":
          case "Clinic 2":
          case "Clinic 3":
          case "Clinic 4":
          case "Clinic 5":
          case "Clinic 6":
          case "Clinic 7":
          case "Clinic 8":
          case "Clinic 9":
          case "Clinic 10":
          case "Pet Training":
          case "PET TRAINING":
          case "pet training":
          case "Pet-boarding":
          case "pet-boarding":
          case "PetBoarding":
            redirectPath = "/pet-boarding";
            console.log("Redirecting to pet-boarding, role:", roleToCheck);
            break;
          default:
            redirectPath = "/user-dashboard";
            console.log("Defaulting to user-dashboard, role:", roleToCheck);
            console.log("Role did not match any cases");
        }

        router.push(redirectPath);
        toast.success(`Welcome, ${session.name}!`);
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("Authentication failed");
        router.push("/");
      }
    };

    handleCallback();
  }, [router, setAuthUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}
