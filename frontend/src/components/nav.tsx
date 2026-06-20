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
  ];

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <nav className="bg-slate-950 border-b border-slate-800/60">
      <div className="max-w-5xl mx-auto px-6 flex items-center gap-6 h-14">
        <Link href="/" className="flex items-center gap-2 shrink-0 mr-2 group">
          <Logo />
          <span className="text-white font-semibold text-sm tracking-tight group-hover:text-indigo-300 transition-colors">
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
                  className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "text-white bg-white/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
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
              <span className="text-slate-400 text-sm hidden sm:block">{user?.username}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                user?.role === "master"
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "bg-slate-700 text-slate-400"
              }`}>
                {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 px-3 py-1.5 rounded-md transition-colors"
              >
                {t.auth.logout}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 px-3 py-1.5 rounded-md transition-colors"
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
