"use client";

import { useState, useEffect } from "react";
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

// Initialize Appwrite Client
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67094c000023e950be96");

const databases = new Databases(client);

const aspects = [
  "Overall Experience",
  "Pet Handling",
  "Staff Friendliness",
  "Ease of Booking",
  "Cleanliness",
];

const tags = ["Pet Trainee", "Pet Grooming", "Pet Clinic", "Pet Boarding"];

function RatingStars({ rating, onRatingChange }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 cursor-pointer transition-colors ${
            star <= rating
              ? "text-yellow-400 fill-current"
              : "text-gray-300 hover:text-yellow-200"
          }`}
          onClick={() => onRatingChange(star)}
        />
      ))}
    </div>
  );
}

export default function FeedbackForm() {
  const [user, setUser] = useState(null);
  const [ratings, setRatings] = useState({});
  const [review, setReview] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch the current user's info upon mounting
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const handleRatingChange = (aspect, rating) => {
    setRatings((prev) => ({ ...prev, [aspect]: rating }));
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
  
    try {
      if (!user) {
        alert("User information not available. Please log in again.");
        return;
      }
  
      // Ensure all ratings are within the valid range (1 to 5)
      const data = {
        overallExperience: ratings["Overall Experience"] || 1, // Default to 1
        petHandling: ratings["Pet Handling"] || 1,             // Default to 1
        staffFriendliness: ratings["Staff Friendliness"] || 1, // Default to 1
        easeOfBooking: ratings["Ease of Booking"] || 1,        // Default to 1
        cleanliness: ratings["Cleanliness"] || 1,              // Default to 1
        experienceFeedback: review,
        tags: selectedTags,
        users: [user.$id], // Wrap the user's ID in an array
      };
  
      // Save data to the ratings collection
      await databases.createDocument(
        "670a040f000893eb8e06", // Database ID
        "671bd05400135c37afc1", // Collection ID
        "unique()", // Generates a unique document ID
        data
      );
  
      alert("Review submitted successfully!");
  
      // Reset form after submission
      setRatings({});
      setReview("");
      setSelectedTags([]);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <Card className="w-full max-w-6xl mx-auto mt-24">
      <CardHeader>
        <CardTitle>Share Your Pet Care Experience</CardTitle>
        <CardDescription>
          We value your feedback to improve our services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rate your experience</h3>
            {aspects.map((aspect) => (
              <div key={aspect} className="flex items-center justify-between">
                <span className="text-sm font-medium">{aspect}</span>
                <RatingStars
                  rating={ratings[aspect] || 0}
                  onRatingChange={(rating) =>
                    handleRatingChange(aspect, rating)
                  }
                />
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="review" className="text-base">
              Share your experience
            </Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us about your visit and your pet's experience..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  onClick={() => handleTagToggle(tag)}
                  className="text-sm"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          className="w-full"
          disabled={loading}
          onClick={handleSubmit} // Trigger form submission on button click
        >
          {loading ? "Submitting..." : "Submit Review"}
        </Button>
      </CardFooter>
    </Card>
  );
}
