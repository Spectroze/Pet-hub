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
import { Client, Databases, Account } from "appwrite";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const [clinicRole, setClinicRole] = useState(null);

  useEffect(() => {
    const getCurrentUserRole = async () => {
      try {
        const account = new Account(client);
        const user = await account.get();
        console.log("Fetched user:", user);
        const userRole = user.prefs?.clinicRole || null;
        console.log("User role:", userRole);
        setClinicRole(userRole);
      } catch (error) {
        console.error("Failed to fetch user role:", error);
      }
    };

    getCurrentUserRole();
  }, []);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await databases.listDocuments(
          "670a040f000893eb8e06",
          "671bd05400135c37afc1"
        );
        console.log("Raw feedback data:", response.documents);

        if (!response.documents || response.documents.length === 0) {
          console.log("No feedback documents found");
          return;
        }

        const feedbackData = response.documents.map((doc) => {
          console.log("Processing document:", doc);

          const cleanTags = Array.isArray(doc.tags)
            ? doc.tags.map((tag) => tag.replace(/['"[\]]/g, "").trim())
            : [];

          const feedback = {
            id: doc.$id,
            clientName: doc.users?.[0]?.name || "Unknown User",
            clientAvatar: doc.users?.[0]?.avatar || null,
            petName: doc.petName || "Unknown Pet",
            petType: doc.petType ? doc.petType.toLowerCase() : "unknown",
            rating: parseInt(doc.overallExperience) || 0,
            comment: doc.experienceFeedback || "No feedback provided.",
            tags: cleanTags,
            date: new Date(doc.$createdAt),
          };

          console.log("Processed feedback:", feedback);
          return feedback;
        });

        console.log("Final feedback data:", feedbackData);
        setFeedbackList(feedbackData);
      } catch (error) {
        console.error("Failed to fetch feedback:", error);
      }
    };

    fetchFeedback();
  }, []);

  const sortedAndFilteredFeedback = feedbackList
    .filter((feedback) => {
      return filterPetType === "all" || feedback.petType === filterPetType;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return b.date.getTime() - a.date.getTime();
      } else {
        return b.rating - a.rating;
      }
    });

  return (
    <Card className="w-full max-w-3xl mx-auto bg-[#FAF5E6] text-[#2D2C2E] pb-8 shadow-xl">
      <CardHeader className="text-center border-b border-[#FBBD0D]/20 pb-4">
        <CardDescription className="text-base text-[#2D2C2E]/90 mt-1">
          See what our furry friends&apos; humans are saying! (
          {sortedAndFilteredFeedback.length} reviews)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:space-x-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[140px] bg-[#FAF5E6] text-sm text-[#2D2C2E] border-[#FBBD0D] hover:bg-[#FAF5E6]/90 transition-colors">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#FAF5E6] text-sm text-[#2D2C2E] border-[#FBBD0D]">
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="rating">Sort by Rating</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPetType} onValueChange={setFilterPetType}>
              <SelectTrigger className="w-full sm:w-[140px] bg-[#FAF5E6] text-sm text-[#2D2C2E] border-[#FBBD0D] hover:bg-[#FAF5E6]/90 transition-colors">
                <SelectValue placeholder="Filter by pet" />
              </SelectTrigger>
              <SelectContent className="bg-[#FAF5E6] text-sm text-[#2D2C2E] border-[#FBBD0D]">
                <SelectItem value="all">All Pets</SelectItem>
                <SelectItem value="dog">Dogs</SelectItem>
                <SelectItem value="cat">Cats</SelectItem>
                <SelectItem value="rabbit">Rabbits</SelectItem>
                <SelectItem value="fish">Fish</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="h-[300px] rounded-lg border border-[#FBBD0D]/30 bg-gradient-to-br from-[#FAF5E6] to-[#FAF5E6]/80 p-3">
            <div className="space-y-3">
              {sortedAndFilteredFeedback.map((feedback) => {
                const PetIcon = petIcons[feedback.petType] || Dog;
                return (
                  <div
                    key={feedback.id}
                    className="relative p-2.5 rounded-lg border border-[#FBBD0D]/20 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-[#FAF5E6] to-[#FAF5E6]/90 group hover:border-[#FBBD0D]/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FD1F4A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                    <div className="relative">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6 border border-[#FBBD0D]/30">
                              {feedback.clientAvatar ? (
                                <AvatarImage
                                  src={feedback.clientAvatar}
                                  alt={feedback.clientName}
                                  className="object-cover"
                                />
                              ) : (
                                <AvatarFallback className="bg-[#FAF5E6] text-[#FBBD0D] text-xs">
                                  {feedback.clientName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>

                            <div>
                              <h4 className="font-medium text-sm text-[#FBBD0D]">
                                {feedback.clientName}
                              </h4>
                              <p className="text-xs text-[#2D2C2E]/70">
                                {feedback.petName}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center space-x-0.5">
                            {Array.from({ length: feedback.rating }).map(
                              (_, index) => (
                                <Star
                                  key={index}
                                  className="w-3 h-3 text-[#FBBD0D] fill-[#FBBD0D]"
                                />
                              )
                            )}
                          </div>
                          <p className="text-[10px] text-[#2D2C2E]/60">
                            {feedback.date.toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="mt-1.5 text-[#2D2C2E]/90 italic text-xs">
                        &ldquo;{feedback.comment}&rdquo;
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {feedback.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-1.5 py-0.5 bg-[#FAF5E6] text-[#2D2C2E] rounded-sm text-[10px] border border-[#FBBD0D]/30 hover:border-[#FBBD0D]/60 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <p className="text-sm text-gray-600">
            We&apos;d love to hear your feedback!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
