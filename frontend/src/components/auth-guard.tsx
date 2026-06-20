"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !isLoggedIn) {
      router.replace("/login");
    }
  }, [hydrated, isLoggedIn, router]);

  // Wait for localStorage to be read before rendering or redirecting
  if (!hydrated) return null;
  if (!isLoggedIn) return null;

  return <>{children}</>;
}
