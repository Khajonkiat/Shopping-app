"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/components/locale-provider";
import { useRequireAuth } from "@/lib/use-require-auth";
import { card, inputCls, btnPrimary, labelCls } from "@/lib/styles";

export default function AccountPage() {
  const { t } = useLocale();
  const { ready } = useRequireAuth();
  const { user, setAuth } = useAuth();

  const [username, setUsername] = useState(user?.username ?? "");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!ready) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await api.auth.updateMe({ username, password: password || undefined });
      setAuth(res.token, res.user);
      setPassword("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 max-w-md">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1a1208]">{t.auth.accountTitle}</h1>
        <p className="text-sm text-[#a0907c] mt-1">{user?.email}</p>
      </div>

      <div className={`${card} p-6`}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelCls}>{t.auth.username}</label>
            <input
              className={inputCls}
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>{t.auth.password}</label>
            <input
              type="password"
              className={inputCls}
              placeholder={t.auth.passwordHint}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-[#4a7a3a] bg-[#f2f7ee] border border-[#c8ddb8] rounded-lg px-3 py-2">
              {t.auth.accountSaved}
            </p>
          )}

          <div className="pt-1 border-t border-[#e8dfd5]">
            <button type="submit" className={btnPrimary} disabled={submitting || !username.trim()}>
              {submitting ? t.common.saving : t.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
