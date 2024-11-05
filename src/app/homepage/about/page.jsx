import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function About() {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

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
      id="about"
      className="w-full py-16 md:py-24 lg:py-36 bg-white"
      ref={ref} // Attach ref here to trigger the animation
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
          The Paw Pals Story
        </motion.h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <motion.div variants={itemVariants} className="flex-1">
            <p className="text-lg text-[#6B6B6B] mb-4">
              At Paw Pals, we're not just pet care providers – we're pet lovers
              on a mission! Our journey began with a simple idea: to create a
              place where pets feel as loved and cared for as they do at home.
            </p>
            <p className="text-lg text-[#6B6B6B]">
              Every wag, purr, and happy bark fuels our passion. We've built a
              team of dedicated animal enthusiasts who treat each pet as if it
              were their own. Because at Paw Pals, every pet is family!
            </p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="flex-1 flex justify-center"
          >
            <img
              src="/images/home.png"
              alt="Happy pets with Paw Pals staff"
              className="rounded-lg shadow-lg max-w-md bg-[#FFF9E6]"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
