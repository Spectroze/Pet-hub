"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { account, databases, appwriteConfig } from "@/lib/appwrite";
import { useAuthUserStore } from "@/store/user";
import { Query, ID, Client } from "appwrite";
import { toast } from "react-toastify";

export default function AuthCallback() {
  const router = useRouter();
  const { setAuthUser } = useAuthUserStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("Auth callback started");
        
        // Initialize a new client for this session
        const client = new Client()
          .setEndpoint(appwriteConfig.endpoint)
          .setProject(appwriteConfig.projectId);

        try {
          // Get the current URL and parse it
          const currentUrl = window.location.href;
          const url = new URL(currentUrl);
          
          // Log the full URL and its parts for debugging
          console.log("Current URL:", currentUrl);
          console.log("URL hash:", url.hash);
          console.log("URL search:", url.search);
          
          // Handle both hash and query parameters
          const hashParams = new URLSearchParams(url.hash.substring(1));
          const queryParams = new URLSearchParams(url.search);
          
          // Log all parameters for debugging
          console.log("Hash params:", Object.fromEntries(hashParams));
          console.log("Query params:", Object.fromEntries(queryParams));

          // Function to handle retries with exponential backoff
          const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
            let retries = 0;
            let delay = initialDelay;

            while (retries < maxRetries) {
              try {
                return await fn();
              } catch (error) {
                if (error.code === 429) { // Rate limit error
                  console.log(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${retries + 1}/${maxRetries})`);
                  await new Promise(resolve => setTimeout(resolve, delay));
                  delay *= 2; // Exponential backoff
                  retries++;
                } else {
                  throw error;
                }
              }
            }
            throw new Error("Max retries reached");
          };

          // Try to get the session directly from Appwrite with retry logic
          try {
            const session = await retryWithBackoff(async () => {
              const session = await account.get();
              if (!session) {
                throw new Error("No session found");
              }
              return session;
            });

            console.log("Session found:", session);
            
            // Check if user exists in database with retry logic
            const existingUser = await retryWithBackoff(async () => {
              return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                [Query.equal("accountId", session.$id)]
              );
            });

            let userData;
            const isNewUser = existingUser.total === 0;

            // Construct avatar URL properly
            const avatarUrl = session.prefs?.avatar
              ? `https://lh3.googleusercontent.com/a/${session.prefs.avatar}`
              : "https://ui-avatars.com/api/?name=" + encodeURIComponent(session.name);

            if (isNewUser) {
              console.log("Creating new user document");
              // Create new user document with retry logic
              userData = await retryWithBackoff(async () => {
                return await databases.createDocument(
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
              });
            } else {
              userData = existingUser.documents[0];
              
              // Update avatar if it has changed with retry logic
              if (userData.avatar !== avatarUrl) {
                userData = await retryWithBackoff(async () => {
                  return await databases.updateDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.userCollectionId,
                    userData.$id,
                    {
                      avatar: avatarUrl,
                    }
                  );
                });
              }
            }

            // Set auth user in store
            setAuthUser({
              accountId: session.$id,
              email: session.email,
              name: session.name,
              role: userData.role || "user",
              avatar: avatarUrl,
              status: userData.status || ["active"],
            });

            // For new users, always redirect to user dashboard
            if (isNewUser) {
              console.log("New user - redirecting to user dashboard");
              router.push("/user-dashboard");
              toast.success(`Welcome to PetCare, ${session.name}!`);
              return;
            }

            // For existing users, redirect based on role
            const roleToCheck = (userData.role || "user").trim().toLowerCase();
            let redirectPath;

            if (roleToCheck === "admin") {
              redirectPath = "/admin";
            } else if (
              roleToCheck.includes("clinic") ||
              roleToCheck.includes("pet training") ||
              roleToCheck.includes("pet-boarding") ||
              roleToCheck === "petboarding"
            ) {
              redirectPath = "/pet-boarding";
            } else {
              redirectPath = "/user-dashboard";
            }

            console.log(`Redirecting to ${redirectPath}`);
            router.push(redirectPath);
            toast.success(`Welcome back, ${session.name}!`);
            return;
          } catch (sessionError) {
            console.error("Session error:", sessionError);
            
            if (sessionError.code === 429) {
              toast.error("Server is busy. Please try again in a few moments.");
              router.push('/login');
              return;
            }
            
            if (sessionError.message?.includes('missing scope')) {
              console.log("Retrying with correct scopes...");
              const hostname = window.location.origin;
              await account.createOAuth2Session(
                "google",
                `${hostname}/auth-callback`,
                `${hostname}/login`,
                ['https://www.googleapis.com/auth/userinfo.email', 
                 'https://www.googleapis.com/auth/userinfo.profile',
                 'openid']
              );
              return;
            }
          }
          
          // If we get here, something went wrong
          console.error("Authentication failed. No valid session found.");
          toast.error("Authentication failed. Please try logging in again.");
          router.push('/');
        } catch (error) {
          console.error("Auth callback error:", error);
          toast.error("Authentication failed. Please try again.");
          router.push('/');
        }

      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("Authentication failed. Please try again.");
        router.push('/');
      }
    };

    handleCallback();
  }, [router, setAuthUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Please wait while we set up your account...</p>
      </div>
    </div>
  );
}
