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
          The Pet-Care Story
        </motion.h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <motion.div variants={itemVariants} className="flex-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#4A4A4A] mb-8">
              Mission
            </h2>
            <p className="text-lg text-[#6B6B6B] mb-4">
              At Pet-Care, our mission is to provide comprehensive and
              compassionate services that meet every aspect of your pet’s needs.
              From expert grooming that keeps them looking and feeling their
              best, to professional veterinary care that ensures their health
              and vitality, to specialized training that nurtures their
              behavior, and secure boarding that feels like a second home—we are
              dedicated to creating a sanctuary where pets feel cherished, safe,
              and loved. Guided by our passion for animals, we strive to enrich
              the lives of pets and their owners, one wagging tail, gentle purr,
              or playful bark at a time.
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#4A4A4A] mb-8">
              Vision
            </h2>
            <p className="text-lg text-[#6B6B6B]">
              At Pet-Care, we aspire to be the trusted leader in holistic pet
              care, setting the gold standard for quality, compassion, and
              innovation. We envision a future where every pet thrives in an
              environment of love, health, and happiness, supported by expert
              grooming, advanced veterinary care, transformative training, and
              safe, welcoming boarding. Our goal is to build lasting
              relationships with pets and their owners, fostering a world where
              every pet is valued as family and every wag, purr, and joyful bark
              reflects a life well cared for.
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
