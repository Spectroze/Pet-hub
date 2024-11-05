"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "./homepage/header/page";
import Landing from "./homepage/hero/page";
import Services from "./homepage/services/page";
import Footer from "./homepage/footer/page";
import About from "./homepage/about/page";
import Contact from "./homepage/contact/page";
import Testimonial from "./homepage/testimonial/page";

export default function Hero() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9E6]">
      <Header />
      <main className="flex-1">
        <Landing />
        <Services />
        <About />
        <Contact />
        <Testimonial />
      </main>
      <Footer />
    </div>
  );
}
