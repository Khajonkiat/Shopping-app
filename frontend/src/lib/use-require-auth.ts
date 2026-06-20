"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth";

export function useRequireAuth() {
  const { isLoggedIn, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !isLoggedIn) router.replace("/login");
  }, [hydrated, isLoggedIn, router]);

  return { ready: hydrated && isLoggedIn };
}
