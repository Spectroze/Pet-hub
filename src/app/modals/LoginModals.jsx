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
import { signIn, getCurrentUser } from "@/lib/appwrite"; // Adjust import as needed
import { useAuthUserStore } from "@/store/user";
import SignupModal from "./SignupModal"; // Import the SignupModal component

export default function LoginModal({ showLoginModal, setShowLoginModal }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const router = useRouter();

  const { authUser, setAuthUser } = useAuthUserStore();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const account = await signIn(email, password);
      setShowLoginModal(false);

      // Get current user role and update Zustand store
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const role = currentUser.role;
        setAuthUser({ ...currentUser, role });

        // Redirect based on role
        if (role === "admin") {
          router.push("/admin");
          toast.success(`Welcome back, ${account.name}!`);
        } else if (role === "Pet Training") {
          router.push("/pet-training");
          toast.success(`Welcome back, ${account.name}!`);
        } else if (role === "pet-boarding") {
          router.push("/pet-boarding");
          toast.success(`Welcome back, ${account.name}!`);
        } else if (role === "Pet Boarding 2") {
          router.push("/pet-boarding-2");
          toast.success(`Welcome back, ${account.name}!`);
        } else if (role === "clinic") {
          router.push("/Clinic-dashboard");
          toast.success(`Welcome back, ${account.name}!`);
        } else {
          router.push("/user-dashboard");
          toast.success(`Welcome back, ${account.name}!`);
        }
      } else {
        toast.error("User not found. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.message || "An unexpected error occurred.";
      toast.error(errorMessage);
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
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-blue-100 to-green-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <span>PetCare Login</span>
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4 py-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-primary">
                Email
              </Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 border-primary focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-primary">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 border-primary focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={switchToSignup}
                className="text-sm text-primary hover:underline"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <SignupModal
        showSignupModal={showSignupModal}
        setShowSignupModal={setShowSignupModal}
        switchToLogin={switchToLogin}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
