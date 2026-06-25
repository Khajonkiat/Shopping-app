"use client";
import { useState } from "react";
import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import TopBar from "./top-bar";
import Nav from "./nav";

export default function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { isLoggedIn } = useAuth();

  const sidebarWidth = isLoggedIn ? (collapsed ? "ml-16" : "ml-56") : "";

  return (
    <>
      <TopBar onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex mt-14">
        <Nav collapsed={collapsed} />
        <main className={`flex-1 min-w-0 px-6 py-6 transition-all duration-200 ${sidebarWidth}`}>
          <div className="max-w-5xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </>
  );
}
