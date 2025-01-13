"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AtSign, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { signIn, getCurrentUser, signInWithGoogle } from "@/lib/appwrite"; // Adjust import as needed
import { useAuthUserStore } from "@/store/user";
import { FcGoogle } from "react-icons/fc"; // Add this import

export default function LoginModal({ showLoginModal, setShowLoginModal }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const router = useRouter();

  const { authUser, setAuthUser } = useAuthUserStore();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // The redirect will happen automatically
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Failed to sign in with Google");
      setLoading(false);
    }
  };

  const handleRedirect = (role, userName) => {
    setShowLoginModal(false);
    console.log("Role received:", role); // Debug log
    console.log("Username:", userName); // Debug log

    // Check if the role includes "Clinic" (case insensitive)
    if (typeof role === "string" && role.toLowerCase().includes("clinic")) {
      console.log("Clinic role detected, redirecting to pet-boarding");
      router.push("/pet-boarding");
      toast.success(`Welcome back, ${userName}!`);
      return;
    }

    const roleRedirects = {
      admin: "/admin",
      "pet-boarding": "/pet-boarding",
      "Pet Training": "/pet-boarding",
      user: "/user-dashboard",
    };

    const redirectPath = roleRedirects[role] || "/user-dashboard";
    console.log("Redirecting to:", redirectPath); // Debug log
    router.push(redirectPath);
    toast.success(`Welcome back, ${userName}!`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const account = await signIn(email, password);
      const currentUser = await getCurrentUser();
      if (currentUser) {
        console.log("Current user data:", currentUser); // Debug log
        const role = currentUser.role;
        console.log("Role from currentUser:", role); // Debug log
        setAuthUser({ ...currentUser, role });
        handleRedirect(role, account.name);
      } else {
        toast.error("User not found. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  return (
    <>
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-[375px] bg-gradient-to-b from-blue-100 to-green-100 p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl font-bold text-center">
              PetCare Login
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-primary text-sm">
                Email
              </Label>
              <div className="relative">
                <AtSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-8 h-9 text-sm border-primary focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-primary text-sm">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-8 h-9 text-sm border-primary focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-9 text-sm bg-primary hover:bg-primary-dark"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-9 text-sm"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <FcGoogle className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        closeOnClick
        hideProgressBar={true}
      />
    </>
  );
}
