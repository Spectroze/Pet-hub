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

import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "appwrite";

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
        setLoading(false);
        return;
      }

      // Prepare the data with the serviceTag set to "Pet Trainee"
      const data = {
        overallExperience: ratings["Overall Experience"] || 0,
        petHandling: ratings["Pet Handling"] || 0,
        staffFriendliness: ratings["Staff Friendliness"] || 0,
        easeOfBooking: ratings["Ease of Booking"] || 0,
        cleanliness: ratings["Cleanliness"] || 0,
        experienceFeedback: review || "", // Ensure review is a string
        users: [user.$id], // Ensure user ID is wrapped in an array
        serviceTag: "Pet Trainee", // Assign the service tag explicitly
      };

      // Log data structure to verify
      console.log("Submitting data:", data);

      // Save the feedback to the database
      await databases.createDocument(
        appwriteConfig.databaseId, // Database ID
        "671bd05400135c37afc1", // Collection ID
        ID.unique(), // Generates a unique document ID using Appwrite's ID helper
        data
      );

      alert("Review submitted successfully!");
      setRatings({});
      setReview("");
      setSelectedTags([]);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. See console for details.");
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
