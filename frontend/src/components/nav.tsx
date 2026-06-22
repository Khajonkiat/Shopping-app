"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "./locale-provider";
import { useAuth } from "@/lib/auth";
import LangSwitcher from "./lang-switcher";
import Logo from "./logo";

export default function Nav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();

  const links = [
    { href: "/", label: t.nav.dashboard, exact: true },
    { href: "/products", label: t.nav.products, exact: false },
    { href: "/stores", label: t.nav.stores, exact: false },
    { href: "/purchases", label: t.nav.purchases, exact: false },
    { href: "/household", label: t.nav.household, exact: false },
  ];

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <nav className="bg-white border-b border-[#e8dfd5] sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-6 flex items-center gap-6 h-14">
        <Link href="/" className="flex items-center gap-2 shrink-0 mr-2">
          <Logo />
          <span className="text-[#1a1208] font-semibold text-sm tracking-tight">
            Shopping Home
          </span>
        </Link>

        {isLoggedIn && (
          <div className="flex items-center gap-0.5 flex-1">
            {links.map((l) => {
              const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    active
                      ? "text-[#1a1208] font-medium bg-[#f0e9e0]"
                      : "text-[#7a6858] hover:text-[#1a1208] hover:bg-[#f7f2ec]"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-[#9c8c7c] text-sm hidden sm:block">{user?.username}</span>
              {user?.role === "master" && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#f0e9e0] text-[#7a6858]">
                  {user.role}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-[#9c8c7c] hover:text-[#1a1208] transition-colors"
              >
                {t.auth.logout}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm text-[#7a6858] hover:text-[#1a1208] transition-colors"
            >
              {t.auth.login}
            </Link>
          )}
          <LangSwitcher />
        </div>
      </div>
    </nav>
  );
}
