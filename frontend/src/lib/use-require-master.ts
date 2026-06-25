"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth";

export function useRequireMaster() {
  const { isLoggedIn, hydrated, isMaster } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!isLoggedIn) router.replace("/login");
    else if (!isMaster) router.replace("/");
  }, [hydrated, isLoggedIn, isMaster, router]);

  return { ready: hydrated && isLoggedIn && isMaster };
}
