"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useLocale } from "@/components/locale-provider";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
    } catch {
      // Swallow errors — always show the generic success message.
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-center text-[#1a1208] mb-2">
          {t.auth.forgotPasswordTitle}
        </h1>
        <p className="text-sm text-center text-[#7a6858] mb-7">
          {t.auth.forgotPasswordSubtitle}
        </p>

        {submitted ? (
          <div className="bg-white border border-[#d9cfc3] rounded-2xl p-7 text-center space-y-4">
            <p className="text-sm text-[#5c4433]">{t.auth.forgotPasswordSuccess}</p>
            <Link
              href="/login"
              className="inline-block text-sm text-[#b07040] hover:text-[#8f5a32] font-medium transition-colors"
            >
              {t.auth.backToLogin}
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#d9cfc3] rounded-2xl p-7 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#5c4433] uppercase tracking-wide">
                {t.auth.email}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-[#d9cfc3] rounded-lg px-3 py-2.5 text-sm text-[#1a1208] placeholder:text-[#c4b5a5] focus:outline-none focus:border-[#b07040] transition-colors"
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 bg-[#b07040] hover:bg-[#8f5a32] disabled:opacity-40 text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors"
            >
              {loading ? t.common.loading : t.auth.forgotPasswordTitle}
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
