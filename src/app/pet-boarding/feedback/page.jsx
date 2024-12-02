"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dog, Cat, Rabbit, Fish, Star } from "lucide-react";
import { Client, Databases } from "appwrite";

// Initialize Appwrite Client
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67094c000023e950be96");

const databases = new Databases(client);

const petIcons = {
  dog: Dog,
  cat: Cat,
  rabbit: Rabbit,
  fish: Fish,
};

export default function Feedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [filterPetType, setFilterPetType] = useState("all");

  // Fetch feedback data from the database
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await databases.listDocuments(
          "670a040f000893eb8e06", // Database ID
          "671bd05400135c37afc1" // Collection ID
        );

        // Filter feedback to include only entries with the "pet trainee" tag
        const feedbackData = response.documents
          .map((doc) => ({
            id: doc.$id,
            clientName: doc.users[0]?.name || "Unknown User", // Extract the name property
            petName: doc.petName || "Unknown Pet",
            petType: doc.petType ? doc.petType.toLowerCase() : "unknown", // Ensure lowercase for matching icons
            rating: doc.overallExperience || 0, // Default to 0 if not provided
            comment: doc.experienceFeedback || "No feedback provided.",
            tags: doc.tags || [], // Include tags and default to an empty array if not provided
            date: new Date(doc.$createdAt), // Convert to Date object
          }))
          .filter((feedback) =>
            feedback.tags.some(
              (tag) => tag.toLowerCase().trim() === "pet boarding"
            )
          );

        setFeedbackList(feedbackData);
      } catch (error) {
        console.error("Failed to fetch feedback:", error);
      }
    };
    fetchFeedback();
  }, []);

  const sortedAndFilteredFeedback = feedbackList
    .filter(
      (feedback) =>
        filterPetType === "all" || feedback.petType === filterPetType
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return b.date.getTime() - a.date.getTime();
      } else {
        return b.rating - a.rating;
      }
    });

  return (
    <Card className="w-full max-w-8xl mx-auto bg-gradient-to-br from-cyan-900 to-blue-900 text-white pb-14">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold text-cyan-300">
          Pawsome Feedback
        </CardTitle>
        <CardDescription className="text-lg text-cyan-100">
          See what our furry friends' humans are saying about Pet Training!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-center space-x-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-cyan-800 text-cyan-100 border-cyan-600">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-cyan-800 text-cyan-100">
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="rating">Sort by Rating</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPetType} onValueChange={setFilterPetType}>
              <SelectTrigger className="w-[180px] bg-cyan-800 text-cyan-100 border-cyan-600">
                <SelectValue placeholder="Filter by pet" />
              </SelectTrigger>
              <SelectContent className="bg-cyan-800 text-cyan-100">
                <SelectItem value="all">All Pets</SelectItem>
                <SelectItem value="dog">Dogs</SelectItem>
                <SelectItem value="cat">Cats</SelectItem>
                <SelectItem value="rabbit">Rabbits</SelectItem>
                <SelectItem value="fish">Fish</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="h-[500px] rounded-lg border border-cyan-600 bg-cyan-800/50 p-4">
            {sortedAndFilteredFeedback.map((feedback) => {
              const PetIcon = petIcons[feedback.petType] || Dog; // Fallback to Dog icon if petType is unknown
              return (
                <div
                  key={feedback.id}
                  className="mb-6 p-4 border border-cyan-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-r from-cyan-800 to-blue-800"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="bg-cyan-700 p-2 rounded-full">
                        <PetIcon className="w-6 h-6 text-cyan-300" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-cyan-300">
                          {feedback.clientName} {/* Render name as string */}
                        </h4>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center">
                        {Array.from({ length: feedback.rating }).map(
                          (_, index) => (
                            <Star
                              key={index}
                              className="w-5 h-5 text-yellow-400 fill-current"
                            />
                          )
                        )}
                      </div>
                      <p className="text-sm text-cyan-400 mt-1">
                        {feedback.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-cyan-100 italic">
                    &ldquo;{feedback.comment}&rdquo;
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {feedback.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-cyan-700 text-cyan-300 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
