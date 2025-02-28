"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
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
import { Client, Databases } from "appwrite";

// Initialize Appwrite Client
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67094c000023e950be96");

const databases = new Databases(client);

const StarRating = ({ rating, size = "small" }) => (
  <div className="flex items-center justify-center gap-0.5 sm:gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <div key={star} className="relative">
        <Star
          className={`${
            size === "small" ? "h-4 w-4 sm:h-5 sm:w-5" : "h-5 w-5 sm:h-6 sm:w-6"
          } text-gray-300`}
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            width: `${Math.max(
              0,
              Math.min(100, (rating - (star - 1)) * 100)
            )}%`,
          }}
        >
          <Star
            className={`${
              size === "small"
                ? "h-4 w-4 sm:h-5 sm:w-5"
                : "h-5 w-5 sm:h-6 sm:w-6"
            } text-yellow-500 fill-yellow-500`}
          />
        </div>
      </div>
    ))}
  </div>
);

const TestimonialCard = ({ name, avatar, content, rating }) => {
  const displayName = typeof name === "string" ? name : "Anonymous";

  return (
    <Card className="h-full shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardContent className="space-y-6 p-6 sm:p-8 flex flex-col justify-between h-full">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={avatar} alt={`${displayName}'s avatar`} />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-500 text-white">
                {displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
          <blockquote className="text-base sm:text-lg font-medium text-center text-gray-700 italic">
            &quot;{content}&quot;
          </blockquote>
        </div>
        <div>
          <StarRating rating={rating} />
          <p className="text-primary font-semibold text-center text-sm sm:text-base mt-3">
            {displayName}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const TotalRating = ({ testimonials }) => {
  const totalRatings = testimonials.length;
  const averageRating =
    testimonials.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings;

  const ratingCounts = [1, 2, 3, 4, 5].map((stars) => {
    const count = testimonials.filter(
      (t) => Math.round(t.rating) === stars
    ).length;
    const percentage = (count / totalRatings) * 100;
    return { stars, count, percentage };
  });

  return (
    <div className="flex flex-col items-center justify-center space-y-4 bg-white p-6 rounded-2xl shadow-sm w-full max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Overall Rating</h2>
      <div className="flex items-center gap-3">
        <StarRating rating={averageRating} size="large" />
        <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
      </div>
      <p className="text-gray-600 text-sm mb-4">
        Based on {totalRatings} reviews
      </p>
      <div className="w-full space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const { count, percentage } = ratingCounts.find(
            (r) => r.stars === stars
          );
          return (
            <div key={stars} className="flex items-center gap-2">
              <span className="w-14 text-sm">{stars} stars</span>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-sm text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RatingFilterButtons = ({ activeRating, setActiveRating }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      <Button
        variant={activeRating === 0 ? "default" : "outline"}
        onClick={() => setActiveRating(0)}
        className={`px-6 py-2 rounded-full text-sm ${
          activeRating === 0
            ? "bg-yellow-400 text-black hover:bg-yellow-500"
            : "bg-white border-gray-200 hover:bg-gray-50"
        }`}
      >
        All Reviews
      </Button>
      {[5, 4, 3, 2, 1].map((rating) => (
        <Button
          key={rating}
          variant={activeRating === rating ? "default" : "outline"}
          onClick={() => setActiveRating(rating)}
          className={`px-4 py-2 rounded-full min-w-[80px] text-sm flex items-center justify-center gap-1 ${
            activeRating === rating
              ? "bg-yellow-400 text-black hover:bg-yellow-500 border-none"
              : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
        >
          {rating}{" "}
          <Star
            className={`h-3.5 w-3.5 ${
              activeRating === rating ? "fill-black" : "fill-yellow-400"
            }`}
          />
        </Button>
      ))}
    </div>
  );
};

export default function Testimonial() {
  const [testimonials, setTestimonials] = useState([]);
  const [activeRating, setActiveRating] = useState(0);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await databases.listDocuments(
          "670a040f000893eb8e06",
          "671bd05400135c37afc1"
        );

        console.log("Fetched feedback:", response.documents);

        const feedbackData = response.documents.map((doc) => ({
          id: doc.$id,
          name: doc.users || "Anonymous",
          avatar: "", // Use a placeholder if no avatar
          content: doc.experienceFeedback || "No feedback provided",
          rating: doc.overallExperience || 0,
        }));

        setTestimonials(feedbackData);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      }
    };

    fetchFeedback();
  }, []);

  const filteredTestimonials = testimonials.filter(
    (testimonial) =>
      activeRating === 0 || Math.round(testimonial.rating) === activeRating
  );

  return (
    <section
      id="testimonials"
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-5 text-gray-800">
            Voices of Satisfaction
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover what our valued customers have to say about their
            experiences with PetCare Hub.
          </p>
        </div>

        <RatingFilterButtons
          activeRating={activeRating}
          setActiveRating={setActiveRating}
        />

        {filteredTestimonials.length > 0 ? (
          <Carousel className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
            <CarouselContent>
              {filteredTestimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id}>
                  <TestimonialCard {...testimonial} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        ) : (
          <div className="text-center text-gray-500 py-12 bg-gray-100 rounded-lg shadow-inner">
            <p className="text-xl font-semibold">
              No reviews found for this rating
            </p>
            <p className="mt-2">
              Try selecting a different rating or view all reviews.
            </p>
          </div>
        )}

        <div className="pt-16">
          <TotalRating testimonials={testimonials} />
        </div>
      </div>
    </section>
  );
}
