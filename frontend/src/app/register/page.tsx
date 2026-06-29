"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/components/locale-provider";

export default function RegisterPage() {
  const { t } = useLocale();
  const { setAuth, isLoggedIn, hydrated } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && isLoggedIn) router.replace("/");
  }, [hydrated, isLoggedIn, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.auth.register(email, username, password);
      setAuth(res.token, res.user);
      router.replace("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("409")) {
        setError("Email already registered.");
      } else {
        setError(t.auth.registerError);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-center text-[#1a1208] mb-7">{t.auth.registerTitle}</h1>

        <form onSubmit={handleSubmit} className="bg-white border border-[#d9cfc3] rounded-2xl p-7 flex flex-col gap-4">
          {error && (
            <p className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#5c4433] uppercase tracking-wide">{t.auth.email}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-[#d9cfc3] rounded-lg px-3 py-2.5 text-sm text-[#1a1208] placeholder:text-[#c4b5a5] focus:outline-none focus:border-[#b07040] transition-colors"
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#5c4433] uppercase tracking-wide">{t.auth.username}</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-[#d9cfc3] rounded-lg px-3 py-2.5 text-sm text-[#1a1208] placeholder:text-[#c4b5a5] focus:outline-none focus:border-[#b07040] transition-colors"
              autoComplete="username"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#5c4433] uppercase tracking-wide">{t.auth.password}</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-[#d9cfc3] rounded-lg px-3 py-2.5 text-sm text-[#1a1208] placeholder:text-[#c4b5a5] focus:outline-none focus:border-[#b07040] transition-colors"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-[#b07040] hover:bg-[#8f5a32] disabled:opacity-40 text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors"
          >
            {loading ? t.common.loading : t.auth.register}
          </button>
        </form>

        <p className="text-center text-sm text-[#a0907c] mt-5">
          {t.auth.hasAccount}{" "}
          <Link href="/login" className="text-[#4a3728] hover:text-[#1a1208] font-medium transition-colors">
            {t.auth.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
