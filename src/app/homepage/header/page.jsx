"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PawPrintIcon,
  HomeIcon,
  ClipboardListIcon,
  InfoIcon,
  PhoneIcon,
  MessageSquareQuote,
} from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 lg:px-12 py-4 shadow-md bg-white bg-opacity-90 backdrop-blur-md flex items-center">
      <Link
        href="/"
        className="flex items-center gap-2 justify-center"
        prefetch={false}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <PawPrintIcon
            className="h-10 w-10 text-[#FF6B6B]"
            aria-hidden="true"
          />
        </motion.div>
        <span className="text-2xl font-bold text-[#4A4A4A] tracking-wide">
          Pet-Care
        </span>
      </Link>
      <nav className="ml-auto flex gap-6 sm:gap-8">
        {[
          {
            href: "#services",
            icon: <ClipboardListIcon />,
            label: "Services",
          },
          { href: "#about", icon: <InfoIcon />, label: "About" },
          { href: "#contact", icon: <PhoneIcon />, label: "Contact" },
          { href: "/clinic", icon: <HomeIcon />, label: "Clinic" },
          {
            href: "#testimonials",
            icon: <MessageSquareQuote />,
            label: "Testimonials",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm font-medium text-[#4A4A4A] hover:text-[#FF6B6B] hover:bg-[#FFF0F0] px-3 py-2 rounded-full transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
            prefetch={false}
          >
            <motion.div whileHover={{ rotate: 10 }} className="text-[#FF6B6B]">
              {item.icon}
            </motion.div>
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
