"use client";
import { useState, useEffect } from "react";
import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import TopBar from "./top-bar";
import Nav from "./nav";

export default function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem("sidebar_collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  function handleToggle() {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setMobileOpen((o) => !o);
    } else {
      setCollapsed((c) => {
        const next = !c;
        localStorage.setItem("sidebar_collapsed", String(next));
        return next;
      });
    }
  }

  // Mobile: no margin (sidebar is overlay). sm+: ml-56 or ml-16 based on collapsed.
  const sidebarWidth = isLoggedIn ? (collapsed ? "sm:ml-16" : "sm:ml-56") : "";

  return (
    <>
      <TopBar onToggle={handleToggle} />
      {isLoggedIn && mobileOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/30 sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="flex mt-14">
        <Nav collapsed={collapsed} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <main className={`flex-1 min-w-0 px-4 sm:px-6 py-6 transition-all duration-200 ${sidebarWidth}`}>
          <div className="max-w-5xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </>
  );
}
