"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { PawPrintIcon, HeartIcon } from "lucide-react";
import { BooknowModal } from "@/app/modals/BooknowModal";
import LoginModal from "@/app/modals/LoginModals";
import Image from 'next/image';

export default function Landing() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="relative w-full py-16 md:py-24 lg:py-36 xl:py-48 bg-cover bg-center overflow-hidden">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10"
      >
        <motion.div variants={itemVariants} className="flex-1 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight lg:text-6xl text-[#4A4A4A]">
            Tail-Wagging Care for Your Furry Family
          </h1>
          <p className="max-w-2xl text-lg lg:text-xl text-[#6B6B6B]">
            We&apos;re here for your pets. From cuddles to care, we&apos;re here to make tails wag and whiskers twitch with joy!
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openLoginModal}
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#FF6B6B] bg-white px-8 text-base font-medium text-[#FF6B6B] shadow transition-all duration-300"
            >
              <PawPrintIcon className="mr-2" /> Sign in
            </motion.button>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="flex-1">
          <Image
            src="/images/home.jpg"
            alt="Happy pets"
            width={600}
            height={400}
            className="rounded-full shadow-lg object-cover w-full max-w-lg border-4 border-[#FF6B6B]"
          />
        </motion.div>
      </motion.div>

      <LoginModal
        showLoginModal={isLoginModalOpen}
        setShowLoginModal={setIsLoginModalOpen}
      />
    </section>
  );
}
