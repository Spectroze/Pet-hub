import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <footer className="flex flex-col gap-4 sm:flex-row py-8 w-full items-center px-6 md:px-12 bg-[#FFF0F0] border-t border-[#FF6B6B]">
      <p className="text-xs text-[#6B6B6B]">
        &copy; 2024 Paw Pals. All rights reserved. Pets rule, humans drool!
      </p>
      <nav className="sm:ml-auto flex gap-6">
        <Link
          href="#"
          className="text-xs text-[#6B6B6B] hover:text-[#FF6B6B] hover:underline underline-offset-4 transition-colors duration-300"
          prefetch={false}
        >
          Privacy Policy (No Snooping!)
        </Link>
        <Link
          href="#"
          className="text-xs text-[#6B6B6B] hover:text-[#FF6B6B] hover:underline underline-offset-4 transition-colors duration-300"
          prefetch={false}
        >
          Terms of Service (The Pawfect Agreement)
        </Link>
      </nav>
    </footer>
  );
}
