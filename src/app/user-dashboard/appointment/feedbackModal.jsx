"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { getCurrentUser } from "@/lib/appwrite";
import { Client, Databases } from "appwrite";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Initialize Appwrite Client
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67094c000023e950be96");

const databases = new Databases(client);

const tags = ["Clinic 1", "Clinic 2", "Clinic 3", "Clinic 4", "Clinic 5"];

function RatingStars({ rating, onRatingChange }) {
  return (
    <div className="flex items-center justify-center md:justify-start">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 md:w-5 md:h-5 cursor-pointer transition-colors ${
            star <= rating
              ? "text-[#FBBD0D] fill-current"
              : "text-[#2D2C2E] hover:text-[#FBBD0D]"
          }`}
          onClick={() => onRatingChange(star)}
        />
      ))}
    </div>
  );
}

export default function FeedbackFormModal({
  isOpen,
  setIsOpen,
  onSubmitSuccess,
}) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        toast.error("User information not available. Please log in again.");
        return;
      }

      const data = {
        overallExperience: rating || 1,
        petHandling: 1,
        staffFriendliness: 1,
        easeOfBooking: 1,
        cleanliness: 1,
        experienceFeedback: review,
        tags: selectedTags,
        users: [user.$id],
      };

      // Create feedback document
      await databases.createDocument(
        "670a040f000893eb8e06",
        "671bd05400135c37afc1",
        "unique()",
        data
      );

      // Update the appointment to mark it as rated
      const appointmentData = JSON.parse(
        localStorage.getItem("appointmentForFeedback")
      );
      if (appointmentData?.appointmentId) {
        await databases.updateDocument(
          "670a040f000893eb8e06",
          "670ab2db00351bc09a92",
          appointmentData.appointmentId,
          { hasRated: true }
        );
      }

      toast.success("Review submitted successfully!");

      // Reset form
      setRating(0);
      setReview("");
      setSelectedTags([]);
      setIsOpen(false);

      // Call onSubmitSuccess to refresh the table
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#FD1F4A]">
              Pet Care Feedback
            </DialogTitle>
            <DialogDescription className="text-xs text-[#2D2C2E]/80">
              Share your experience with us
            </DialogDescription>
          </DialogHeader>
          <Card className="w-full bg-[#FAF5E6] text-[#2D2C2E] border border-[#FBBD0D] rounded-lg overflow-hidden">
            <CardContent className="p-3 space-y-3">
              <div>
                <Label className="text-sm text-[#FD1F4A]">
                  Rate your experience
                </Label>
                <div className="flex items-center justify-between bg-[#FAF5E6] border border-[#FBBD0D] p-2 rounded-md mt-1">
                  <span className="text-xs font-medium text-[#2D2C2E]">
                    Overall Experience
                  </span>
                  <RatingStars rating={rating} onRatingChange={setRating} />
                </div>
              </div>

              <Separator className="bg-[#FBBD0D]" />

              <div>
                <Label htmlFor="review" className="text-sm text-[#FD1F4A]">
                  Your feedback
                </Label>
                <Textarea
                  id="review"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Tell us about your experience..."
                  className="mt-1 min-h-[80px] bg-white text-[#2D2C2E] border-[#FBBD0D] focus:border-[#FD1F4A] placeholder-[#2D2C2E]/50 rounded-md text-xs"
                />
              </div>

              <div>
                <Label className="text-sm text-[#FD1F4A]">Tags</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tags.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant={
                        selectedTags.includes(tag) ? "default" : "outline"
                      }
                      onClick={() =>
                        setSelectedTags((prev) =>
                          prev.includes(tag)
                            ? prev.filter((t) => t !== tag)
                            : [...prev, tag]
                        )
                      }
                      className={`text-xs rounded-full py-0 px-2 ${
                        selectedTags.includes(tag)
                          ? "bg-[#FD1F4A] text-[#FAF5E6] hover:bg-[#FD1F4A]/90"
                          : "bg-[#FAF5E6] text-[#2D2C2E] hover:bg-[#FBBD0D]/20 border border-[#FBBD0D]"
                      }`}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-[#FAF5E6] border-t border-[#FBBD0D] p-3">
              <Button
                type="button"
                className="w-full h-8 bg-[#FD1F4A] hover:bg-[#FD1F4A]/90 text-[#FAF5E6] transition-colors duration-300 text-xs"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? "Submitting..." : "Submit Review"}
              </Button>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        closeOnClick
      />
    </>
  );
}
