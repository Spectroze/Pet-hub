"use client";
import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { PawPrintIcon } from "lucide-react"; // Ensure Lucide is correctly installed and imported

export default function Contact() {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [inView]); // Removed controls from dependency as it's not needed

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section
      id="contact"
      className="w-full py-16 md:py-24 lg:py-36 bg-[#FFF9E6]"
      ref={ref} // Added ref for triggering the animation
    >
      <motion.div
        initial="hidden"
        animate={controls}
        variants={containerVariants}
        className="container mx-auto px-6 md:px-12 text-center"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl sm:text-4xl font-extrabold text-[#4A4A4A] mb-8"
        >
          Let's Chat!
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="max-w-3xl mx-auto text-lg text-[#6B6B6B] mb-8"
        >
          Have a question? Want to book a service? Or maybe you just want to
          share a cute pet story? We're all ears (and paws)! Drop us a line, and
          we'll get back to you faster than a dog chasing a squirrel.
        </motion.p>

        <motion.div variants={itemVariants} className="max-w-xl mx-auto">
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your Name (and your pet's too!)"
                required
                className="w-full p-4 border border-[#FF6B6B] rounded-full focus:border-[#FF6B6B] focus:ring-[#FF6B6B] transition-all duration-300"
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Your Email (we promise not to spam)"
                required
                className="w-full p-4 border border-[#FF6B6B] rounded-full focus:border-[#FF6B6B] focus:ring-[#FF6B6B] transition-all duration-300"
              />
            </div>
            <div>
              <label htmlFor="message" className="sr-only">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="4"
                placeholder="Your Message (tell us everything!)"
                required
                className="w-full p-4 border border-[#FF6B6B] rounded-2xl focus:border-[#FF6B6B] focus:ring-[#FF6B6B] transition-all duration-300"
              ></textarea>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-3 bg-[#FF6B6B] text-white rounded-full font-medium hover:bg-[#FF6B6B]/90 transition-all duration-300 flex items-center justify-center"
            >
              <PawPrintIcon className="mr-2" /> Send Waggy Message
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </section>
  );
}
