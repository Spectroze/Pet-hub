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

// Icon mapping for pet types
const petIcons = {
  dog: Dog,
  cat: Cat,
  rabbit: Rabbit,
  fish: Fish,
};

export default function Feedback() {
  // State to hold feedback data
  const [feedbackList, setFeedbackList] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [filterPetType, setFilterPetType] = useState("all");
  const [filterServiceTag, setFilterServiceTag] = useState("all");

  // Function to fetch feedback data (replace with your API call)
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        // Replace with your actual API call to fetch feedback data
        const response = await fetch("/api/feedback"); // Example endpoint
        const data = await response.json();
        setFeedbackList(data);
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      }
    };

    fetchFeedback();
  }, []);

  // Filter and sort feedback based on user selection

  // Filter feedback for "Pet Trainee" service
  const petTrainingFeedback = feedbackList.filter(
    (feedback) => feedback.serviceTag === "Pet Trainee"
  );

  return (
    <Card className="w-full max-w-8xl mx-auto bg-gradient-to-br from-cyan-900 to-blue-900 text-white pb-14">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold text-cyan-300">
          Pawsome Feedback
        </CardTitle>
        <CardDescription className="text-lg text-cyan-100">
          See what our furry friends' humans are saying!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-center space-x-4">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-cyan-800 text-cyan-100 border-cyan-600">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-cyan-800 text-cyan-100">
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="rating">Sort by Rating</SelectItem>
              </SelectContent>
            </Select>
            {/* Pet Type Filter Dropdown */}
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
            {/* Service Tag Filter Dropdown */}
            <Select
              value={filterServiceTag}
              onValueChange={setFilterServiceTag}
            >
              <SelectTrigger className="w-[180px] bg-cyan-800 text-cyan-100 border-cyan-600">
                <SelectValue placeholder="Filter by service" />
              </SelectTrigger>
              <SelectContent className="bg-cyan-800 text-cyan-100">
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="Pet Grooming">Pet Grooming</SelectItem>
                <SelectItem value="Pet Trainee">Pet Trainee</SelectItem>
                <SelectItem value="Pet Boarding">Pet Boarding</SelectItem>
                <SelectItem value="Pet Clinic">Pet Clinic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Scrollable Feedback List */}
          <ScrollArea className="h-[500px] rounded-lg border border-cyan-600 bg-cyan-800/50 p-4">
            {petTrainingFeedback.map((feedback) => {
              const PetIcon = petIcons[feedback.petType];
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
                          {feedback.clientName}
                        </h4>
                        <p className="text-sm text-cyan-400">
                          Pet: {feedback.petName} ({feedback.petType})
                        </p>
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
                        {new Date(feedback.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-cyan-100 italic">
                    &ldquo;{feedback.comment}&rdquo;
                  </p>
                </div>
              );
            })}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
