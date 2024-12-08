import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { motion, useAnimation } from "framer-motion";
import {
  ScissorsIcon,
  HomeIcon,
  StethoscopeIcon,
  DumbbellIcon,
} from "lucide-react";

export default function Services() {
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
      id="services"
      className="w-full py-16 md:py-24 lg:py-36 bg-[#FFF0F0]"
      ref={ref}
    >
      <motion.div
        initial="hidden"
        animate={controls}
        variants={containerVariants}
        className="container mx-auto px-6 md:px-12"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl sm:text-4xl font-extrabold text-[#4A4A4A] mb-12 text-center"
        >
          Pet-Care Services for Your Furry Friends
        </motion.h2>
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <ServiceCard
            Icon={ScissorsIcon}
            title="Grooming"
            description="Pamper your pet with our gentle, professional grooming. We'll have them looking and feeling fabulous!"
          />
          <ServiceCard
            Icon={HomeIcon}
            title="Boarding"
            description="A cozy home away from home for your furry friend. Plenty of love and playtime included!"
          />
          <ServiceCard
            Icon={StethoscopeIcon}
            title="Veterinary Care"
            description="Top-notch health care to keep your pet's tail wagging. Your pet's wellness is our priority!"
          />
          <ServiceCard
            Icon={DumbbellIcon}
            title="Training"
            description="Positive reinforcement to bring out the best in your pet. Let's make learning fun!"
          />
        </div>
      </motion.div>
    </section>
  );
}

function ServiceCard({ Icon, title, description }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center space-y-4 p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
    >
      <motion.div
        whileHover={{ rotate: 10 }}
        className="bg-[#FFF0F0] p-4 rounded-full"
      >
        <Icon className="h-12 w-12 text-[#FF6B6B]" />
      </motion.div>
      <h3 className="text-xl font-bold text-[#4A4A4A]">{title}</h3>
      <p className="text-center text-[#6B6B6B]">{description}</p>
    </motion.div>
  );
}
