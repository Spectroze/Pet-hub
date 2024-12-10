"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function PetCarePage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleThankYouClick = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#FFF5F5] text-gray-700 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#4A4A4A]">
          Pet Care Services
        </h1>

        <Card className="mb-6 bg-white border-2 border-[#FF8B8B] shadow-md shadow-[#FF8B8B]/10 transform hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-[#FF8B8B]">
              Request Submitted
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Your request is being reviewed by our Pet-Care Admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base mb-3 text-gray-600">
              Thank you for submitting your pet care request. Our admin team is
              currently reviewing your application.
            </p>
            <div
              className="bg-[#FFF0E6] border-l-4 border-[#FF8B8B] text-gray-700 p-3 rounded-lg text-sm"
              role="alert"
            >
              <p className="font-bold">Status: Pending Approval</p>
              <p>We'll notify you once your request has been approved.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#FFE5E5] shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-[#FF8B8B]">Thank You</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              We appreciate your interest in our Pet-Care services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base mb-3 text-gray-600">
              Your request has been successfully submitted. We'll get back to
              you soon.
            </p>
            <Button
              className="w-full bg-[#FF8B8B] hover:bg-[#FF7171] transition-colors duration-300 text-white"
              onClick={handleThankYouClick}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Thank You
            </Button>
            <p className="text-xs text-gray-500 mt-3 text-center">
              You will be redirected to the home page in {countdown} seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
