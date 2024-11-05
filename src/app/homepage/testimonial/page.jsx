"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Client, Databases } from "appwrite";

// Initialize Appwrite Client
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67094c000023e950be96");

const databases = new Databases(client);

// StarRating component to display the rating stars
const StarRating = ({ rating, size = "small" }) => (
  <div className="flex items-center justify-center gap-1">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${size === "small" ? "h-5 w-5" : "h-6 w-6"} ${
          i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
        }`}
      />
    ))}
  </div>
);

const TestimonialCard = ({ name, avatar, content, rating }) => {
  // Ensure name is always a string
  const displayName = typeof name === "string" ? name : "Anonymous";

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-center">
          <Avatar>
            <AvatarImage src={avatar} alt={`${displayName}'s avatar`} />
            <AvatarFallback>
              {displayName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
        <blockquote className="text-lg font-medium text-center">
          "{content}"
        </blockquote>
        <StarRating rating={rating} />
        <p className="text-muted-foreground text-center">{displayName}</p>
      </CardContent>
    </Card>
  );
};

// TotalRating component to display the average rating and total number of reviews
const TotalRating = ({ testimonials }) => {
  const totalRatings = testimonials.length;
  const averageRating =
    testimonials.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings;

  return (
    <div className="flex flex-col items-center justify-center space-y-2 bg-gray-50 p-6 mr-80">
      <h3 className="text-2xl font-bold">Overall Rating</h3>
      <StarRating rating={averageRating} size="large" />
      <p className="text-3xl font-bold">{averageRating.toFixed(1)}</p>
      <p className="text-muted-foreground">Based on {totalRatings} reviews</p>
    </div>
  );
};

// Main Testimonial component
export default function Testimonial() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await databases.listDocuments(
          "670a040f000893eb8e06", // Database ID
          "671bd05400135c37afc1" // Collection ID
        );

        console.log("Fetched feedback:", response.documents); // Log to debug

        const feedbackData = response.documents.map((doc) => ({
          id: doc.$id,
          name: doc.users || "Anonymous",
          avatar: "", // Use a placeholder if no avatar
          content: doc.experienceFeedback || "No feedback provided",
          rating: doc.overallExperience || 0, // Default to 0 if missing
        }));

        setTestimonials(feedbackData);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      }
    };

    fetchFeedback();
  }, []);

  return (
    <section id="testimonials" className="py-20 px-6 md:px-12 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-12 text-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground mb-8">
            Hear from our satisfied customers about their experience with
            PetCare Hub.
          </p>
        </div>
        <Carousel className="w-full max-w-2xl ml-36">
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id}>
                <TestimonialCard {...testimonial} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="flex justify-end">
          <TotalRating testimonials={testimonials} />
        </div>
        <div className="pt-8"></div>
      </div>
    </section>
  );
}
