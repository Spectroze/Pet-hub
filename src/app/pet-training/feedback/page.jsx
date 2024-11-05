"use client";

import { useState } from "react";
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

const petIcons = {
  dog: Dog,
  cat: Cat,
  rabbit: Rabbit,
  fish: Fish,
};

export default function Component() {
  const [feedbackList] = useState([
    {
      id: 1,
      clientName: "John Doe",
      petName: "Max",
      petType: "dog",
      rating: 5,
      comment: "Max loved his grooming session!",
      date: new Date(2023, 5, 15),
    },
    {
      id: 2,
      clientName: "Jane Smith",
      petName: "Whiskers",
      petType: "cat",
      rating: 4,
      comment: "Great cat-sitting service, Whiskers was happy.",
      date: new Date(2023, 5, 20),
    },
    {
      id: 3,
      clientName: "Bob Johnson",
      petName: "Hoppy",
      petType: "rabbit",
      rating: 3,
      comment: "Decent rabbit care, but could use more attention.",
      date: new Date(2023, 5, 25),
    },
    {
      id: 4,
      clientName: "Alice Brown",
      petName: "Bubbles",
      petType: "fish",
      rating: 5,
      comment: "Excellent aquarium cleaning service!",
      date: new Date(2023, 6, 1),
    },
    {
      id: 5,
      clientName: "Charlie Wilson",
      petName: "Rocky",
      petType: "dog",
      rating: 4,
      comment: "Rocky enjoyed his stay at the pet hotel.",
      date: new Date(2023, 6, 5),
    },
  ]);

  const [sortBy, setSortBy] = useState("date");
  const [filterPetType, setFilterPetType] = useState("all");

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
          See what our furry friends' humans are saying!
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
                        {feedback.date.toLocaleDateString()}
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
