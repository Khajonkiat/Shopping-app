"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/components/locale-provider";
import { useRequireAuth } from "@/lib/use-require-auth";
import { card } from "@/lib/styles";
import type { Household } from "@/lib/types";

export default function HouseholdPage() {
  const { t } = useLocale();
  const { ready } = useRequireAuth();
  const { user, logout } = useAuth();

  const [household, setHousehold] = useState<Household | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    api.household.get().then(setHousehold).finally(() => setLoading(false));
  }, [ready]);

  async function handleGenerateInvite() {
    try {
      const invite = await api.household.generateInvite();
      setInviteCode(invite.code);
      setCopied(false);
    } catch {
      // ignore — button just stays in its current state
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoinError("");
    try {
      await api.household.join(joinCode.trim());
      setJoinSuccess(true);
      logout();
    } catch {
      setJoinError(t.household.joinError);
    }
  }

  if (!ready || loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-[#a0907c] text-sm">{t.common.loading}</p>
      </div>
    );
  }

  const isAdmin = household?.admin_id === user?.id;

  return (
    <div className="space-y-8 max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight text-[#1a1208]">{t.household.title}</h1>

      {household && (
        <div className={`${card} p-6 space-y-4`}>
          <div>
            <p className="text-xs font-semibold text-[#a0907c] uppercase tracking-wider mb-1">
              {t.household.title}
            </p>
            <p className="text-lg font-semibold text-[#1a1208]">{household.name}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#a0907c] uppercase tracking-wider mb-2">
              {t.household.members}
            </p>
            <ul className="space-y-2">
              {household.members?.map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#f0e9e0] text-[#8f5a32] text-xs font-bold flex items-center justify-center uppercase">
                    {m.username[0]}
                  </span>
                  <span className="text-sm text-[#2a1c10] font-medium">{m.username}</span>
                  <span className="text-xs text-[#a0907c]">{m.email}</span>
                  {m.id === household.admin_id && (
                    <span className="ml-auto text-xs bg-[#f0e9e0] text-[#b07040] font-semibold px-2 py-0.5 rounded-full">
                      admin
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {isAdmin && (
            <div className="pt-2 border-t border-[#f0e9e0] space-y-3">
              <button
                onClick={handleGenerateInvite}
                className="bg-[#b07040] hover:bg-[#8f5a32] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {t.household.inviteButton}
              </button>

              {inviteCode && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#fdf9f5] border border-[#e8dfd5] rounded-lg px-3 py-2 text-xs font-mono text-[#4a3728] break-all">
                    {inviteCode}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 text-xs text-[#b07040] hover:text-[#8f5a32] font-semibold px-3 py-2 border border-[#d4b896] rounded-lg hover:bg-[#f7f0e8] transition-colors"
                  >
                    {copied ? t.household.inviteCopied : t.common.copy}
                  </button>
                </div>
              )}
              {inviteCode && (
                <p className="text-xs text-[#a0907c]">{t.household.inviteCode}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className={`${card} p-6 space-y-4`}>
        <h2 className="text-sm font-semibold text-[#4a3728]">{t.household.joinTitle}</h2>

        {joinSuccess ? (
          <p className="text-sm text-[#4a7a3a] bg-[#f2f7ee] border border-[#c8ddb8] rounded-lg px-3 py-2">
            {t.household.joinSuccess}
          </p>
        ) : (
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder={t.household.joinPlaceholder}
              className="flex-1 border border-[#e8dfd5] rounded-lg px-3 py-2 text-sm text-[#1a1208] focus:outline-none focus:border-[#b07040] transition-colors"
            />
            <button
              type="submit"
              disabled={!joinCode.trim()}
              className="bg-[#2a1c10] hover:bg-[#1a1208] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {t.household.joinButton}
            </button>
          </form>
        )}
        {joinError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {joinError}
          </p>
        )}
      </div>
    </div>
  );
}
