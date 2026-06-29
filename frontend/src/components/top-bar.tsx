"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "./logo";
import LangSwitcher from "./lang-switcher";
import { useAuth } from "@/lib/auth";
import { useLocale } from "./locale-provider";

interface TopBarProps {
  onToggle: () => void;
}

export default function TopBar({ onToggle }: TopBarProps) {
  const { isLoggedIn, user, logout } = useAuth();
  const { t } = useLocale();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#d9cfc3] flex items-center px-4 gap-2 z-30">
      {/* Hamburger + Logo */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="w-9 h-9 flex items-center justify-center rounded-full text-[#7a6858] hover:text-[#1a1208] hover:bg-[#f7f2ec] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <Link href="/" className="flex items-center gap-2 px-1">
          <Logo />
          <span className="font-semibold text-sm tracking-tight text-[#1a1208] hidden sm:block">
            Shopping Home
          </span>
        </Link>
      </div>

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        <LangSwitcher />
        {isLoggedIn ? (
          <>
            <Link href="/account" className="text-[#a0907c] text-sm hidden md:block hover:text-[#1a1208] transition-colors">{user?.username}</Link>
            {user?.role === "master" && (
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#e5d4be] text-[#5c4030] hidden sm:block">
                {user.role}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-[#a0907c] hover:text-[#1a1208] transition-colors"
            >
              {t.auth.logout}
            </button>
          </>
        ) : (
          <Link href="/login" className="text-sm text-[#7a6858] hover:text-[#1a1208] transition-colors">
            {t.auth.login}
          </Link>
        )}
      </div>
    </header>
  );
}
