"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRequireMaster } from "@/lib/use-require-master";
import { useLocale } from "@/components/locale-provider";
import { card, inputCls, btnPrimary, btnSecondary, labelCls, th, td } from "@/lib/styles";
import type { AdminUser } from "@/lib/types";

const roleBadge = (role: string) =>
  role === "master"
    ? "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e5d4be] text-[#7a4a1e]"
    : "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#f0ece8] text-[#6b5244]";

const emptyEdit = { username: "", email: "", role: "user", password: "" };

export default function AdminUsersPage() {
  const { t } = useLocale();
  const { ready } = useRequireMaster();
  const { user: me } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (!ready) return;
    api.admin.users
      .list()
      .then(setUsers)
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  }, [ready]);

  function startEdit(u: AdminUser) {
    setEditingId(u.id);
    setEditForm({ username: u.username, email: u.email, role: u.role, password: "" });
    setEditError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
  }

  async function handleSave() {
    if (editingId === null) return;
    setEditSubmitting(true);
    setEditError("");
    try {
      const updated = await api.admin.users.update(editingId, editForm);
      setUsers((prev) => prev.map((x) => (x.id === editingId ? updated : x)));
      setEditingId(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t.admin.saveError;
      setEditError(msg);
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(u: AdminUser) {
    if (!confirm(t.admin.confirmDelete)) return;
    try {
      await api.admin.users.delete(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      if (editingId === u.id) setEditingId(null);
    } catch {
      alert("Failed to delete user.");
    }
  }

  const isSelf = (u: AdminUser) => u.id === me?.id;

  if (!ready || loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-[#a0907c] text-sm">{t.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1a1208]">{t.admin.title}</h1>
        <p className="text-sm text-[#a0907c] mt-1">
          {users.length} {users.length === 1 ? "account" : "accounts"}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}

      {/* Edit panel */}
      {editingId !== null && (
        <div className={`${card} p-6 border-[#c47830] ring-1 ring-[#c47830]/30`}>
          <h2 className="text-sm font-semibold text-[#4a3728] mb-4">{t.admin.editTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t.admin.col.username}</label>
              <input
                className={inputCls}
                value={editForm.username}
                onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>{t.admin.col.email}</label>
              <input
                type="email"
                className={inputCls}
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>{t.admin.col.role}</label>
              <select
                className={inputCls}
                value={editForm.role}
                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                disabled={isSelf(users.find((u) => u.id === editingId)!)}
              >
                <option value="user">user</option>
                <option value="master">master</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>{t.auth.password}</label>
              <input
                type="password"
                className={inputCls}
                value={editForm.password}
                placeholder={t.admin.passwordHint}
                onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
          </div>
          {editError && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {editError}
            </p>
          )}
          <div className="flex items-center gap-3 mt-5">
            <button
              className={btnPrimary}
              onClick={handleSave}
              disabled={editSubmitting || !editForm.username.trim() || !editForm.email.trim()}
            >
              {editSubmitting ? t.common.loading : t.common.save}
            </button>
            <button className={btnSecondary} onClick={cancelEdit} disabled={editSubmitting}>
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <div className={`${card} p-10 text-center`}>
          <p className="text-[#a0907c] text-sm">{t.admin.noData}</p>
        </div>
      ) : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#d9cfc3] bg-[#f0e7d8]">
                <th className={th}>{t.admin.col.username}</th>
                <th className={th}>{t.admin.col.email}</th>
                <th className={th}>{t.admin.col.role}</th>
                <th className={th}>{t.admin.col.household}</th>
                <th className={th}>{t.admin.col.joined}</th>
                <th className={th}>{t.admin.col.actions}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const self = isSelf(u);
                const isEditing = editingId === u.id;
                return (
                  <tr
                    key={u.id}
                    className={`border-b border-[#e8dfd5] last:border-0 transition-colors ${
                      isEditing ? "bg-[#fdf5ec]" : "hover:bg-[#fdf9f5]"
                    }`}
                  >
                    <td className={`${td} font-medium text-[#1a1208]`}>
                      {u.username}
                      {self && <span className="ml-2 text-xs text-[#a0907c]">(you)</span>}
                    </td>
                    <td className={`${td} text-[#7a6858]`}>{u.email}</td>
                    <td className={td}>
                      <span className={roleBadge(u.role)}>{u.role}</span>
                    </td>
                    <td className={`${td} text-[#7a6858]`}>
                      {u.household_name || <span className="text-[#c4b5a5]">—</span>}
                    </td>
                    <td className={`${td} text-[#a0907c]`}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <button
                            onClick={cancelEdit}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#c47830] text-[#b07040] bg-[#f5e8d4] hover:bg-[#eddcbe] transition-colors"
                          >
                            {t.common.cancel}
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(u)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#d9cfc3] text-[#4a3728] hover:bg-[#e5d4be] hover:border-[#b8a898] transition-colors"
                          >
                            {t.common.edit}
                          </button>
                        )}
                        {!self && (
                          <button
                            onClick={() => handleDelete(u)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#f0ddd5] text-[#c0503a] hover:bg-[#fdf0ee] hover:border-[#e0a09a] transition-colors"
                          >
                            {t.common.delete}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
