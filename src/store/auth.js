"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthUserStore } from "./user";
import { whiteListedPaths } from "./whitelist";

export const useRequireAuth = () => {
  const router = useRouter();
  const { user, isLoading } = useAuthUserStore((state) => ({
    user: state.authUser,
    isLoading: state.isLoading,
  }));

  useEffect(() => {
    if (!isLoading && !user) {
      if (!whiteListedPaths.includes(router.pathname)) {
        router.replace("/"); // Redirect to login if not authenticated
      }
    }
  }, [isLoading, user, router]);
};
