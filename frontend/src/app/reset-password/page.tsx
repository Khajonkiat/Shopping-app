"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useLocale } from "@/components/locale-provider";

function ResetPasswordForm() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setError(t.auth.resetPasswordError);
  }, [token, t.auth.resetPasswordError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.replace("/login"), 2500);
    } catch {
      setError(t.auth.resetPasswordError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-center text-[#1a1208] mb-2">
          {t.auth.resetPasswordTitle}
        </h1>
        <p className="text-sm text-center text-[#7a6858] mb-7">
          {t.auth.resetPasswordSubtitle}
        </p>

        {success ? (
          <div className="bg-white border border-[#d9cfc3] rounded-2xl p-7 text-center space-y-4">
            <p className="text-sm text-emerald-700">{t.auth.resetPasswordSuccess}</p>
            <Link href="/login" className="inline-block text-sm text-[#b07040] hover:text-[#8f5a32] font-medium transition-colors">
              {t.auth.backToLogin}
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#d9cfc3] rounded-2xl p-7 flex flex-col gap-4"
          >
            {error && (
              <p className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#5c4433] uppercase tracking-wide">
                {t.auth.password}
              </label>
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#5c4433] uppercase tracking-wide">
                Confirm password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="border border-[#d9cfc3] rounded-lg px-3 py-2.5 text-sm text-[#1a1208] placeholder:text-[#c4b5a5] focus:outline-none focus:border-[#b07040] transition-colors"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="mt-1 bg-[#b07040] hover:bg-[#8f5a32] disabled:opacity-40 text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors"
            >
              {loading ? t.common.saving : t.auth.resetPasswordTitle}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-[#a0907c] mt-5">
          <Link href="/login" className="text-[#4a3728] hover:text-[#1a1208] font-medium transition-colors">
            {t.auth.backToLogin}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
