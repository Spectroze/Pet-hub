"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import FeedbackFormModal from "./feedbackModal";
import Image from 'next/image';

export function RatingModal({ isOpen, onClose, petPhotoId }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleShare = async () => {
    try {
      setShowFeedback(true);
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#2D2C2E]"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-[425px] z-10"
            >
              <div className="bg-[#FAF5E6] rounded-2xl overflow-hidden shadow-xl">
                {/* Header */}
                <div className="pt-6 sm:pt-8 px-4 sm:px-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#2D2C2E]">
                    Ready to Share Your Thoughts?
                  </h2>
                </div>

                {/* Content */}
                <div className="grid gap-4 sm:gap-6 py-4 sm:py-6 px-4 sm:px-6">
                  <motion.div
                    className="flex justify-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <div className="relative">
                      <Image
                        src={petPhotoId || "/placeholder.svg"}
                        alt="Pet"
                        width={128}
                        height={128}
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover shadow-lg border-4 border-[#FBBD0D]"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                          e.currentTarget.alt = "Placeholder image";
                        }}
                      />
                      <motion.div
                        className="absolute -bottom-2 -right-2 bg-[#FD1F4A] rounded-full p-1.5 sm:p-2 shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.5,
                          type: "spring",
                          stiffness: 500,
                          damping: 15,
                        }}
                      >
                        <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-[#FAF5E6]" />
                      </motion.div>
                    </div>
                  </motion.div>
                  <p className="text-center text-sm sm:text-base text-[#2D2C2E]">
                    Your feedback helps us improve and provide better care for
                    all pets!
                  </p>
                </div>

                {/* Footer */}
                <div className="bg-[#2D2C2E] px-4 sm:px-6 py-4">
                  <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 w-full">
                    <Button
                      type="button"
                      onClick={handleShare}
                      className="w-full bg-[#FD1F4A] hover:bg-[#FD1F4A]/90 text-[#FAF5E6]"
                    >
                      Yes, I'll Share
                    </Button>
                    <Button
                      type="button"
                      onClick={onClose}
                      variant="outline"
                      className="w-full border-[#FBBD0D] text-[#FBBD0D] hover:bg-[#FBBD0D]/10"
                    >
                      Maybe Later
                    </Button>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-2 right-2 p-1.5 sm:p-2 rounded-full hover:bg-[#2D2C2E]/10 transition-colors"
                ></button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <FeedbackFormModal isOpen={showFeedback} setIsOpen={setShowFeedback} />
    </>
  );
}
