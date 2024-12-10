"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AtSign, Lock, Eye, EyeOff, User, Phone, Camera } from "lucide-react";
import { signUp } from "@/lib/appwrite";
import { useAuthUserStore } from "@/store/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SignupModal({
  showSignupModal,
  setShowSignupModal,
  switchToLogin,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [role, setRole] = useState("");
  const router = useRouter();
  const { setAuthUser } = useAuthUserStore();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File size should not exceed 5MB");
        return;
      }
      setAvatar(file);
    }
  };

  const validateForm = () => {
    if (name.trim() === "") {
      toast.error("Name is required.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }

    if (phone.trim() === "" || phone.length < 10) {
      toast.error("Please enter a valid phone number with at least 10 digits.");
      return false;
    }

    if (role === "") {
      toast.error("Please select a role.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const user = await signUp(
        name,
        email,
        password,
        phone,
        avatar,
        role,
        ["Pending"] // Default status
      );

      setAuthUser(user);
      toast.success(
        "Signup successful! Welcome to the service. Your account is pending approval."
      );
      setShowSignupModal(false);
      router.push("/Approval");
    } catch (error) {
      console.error("Signup error:", error.message);
      toast.error(error.message || "An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-blue-100 to-green-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <span>Role Signup</span>
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4 py-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-primary">
              Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="pl-10 border-primary focus:ring-primary"
                required
              />
            </div>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-primary">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9]/g, "");
                  if (numericValue.length <= 11) setPhone(numericValue);
                }}
                placeholder="Enter your phone number"
                className="pl-10 border-primary focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-primary">
              Role
            </Label>
            <Select
              value={role}
              onValueChange={(selectedRole) => setRole(selectedRole)}
              required
            >
              <SelectTrigger className="w-full border-primary focus:ring-primary">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pet Training">Pet Training</SelectItem>
                <SelectItem value="Pet-Boarding">Pet Boarding</SelectItem>
                <SelectItem value="clinic">Pet Veterinary </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo" className="text-primary">
              Photo
            </Label>
            <div className="relative">
              <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
              <Input
                id="avatar"
                type="file"
                onChange={handleAvatarChange}
                accept="image/*"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>

          <div className="text-center">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={switchToLogin}
              className="text-primary font-bold"
            >
              Login
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
