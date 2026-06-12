"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user, updateUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", bio: "", avatar: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user) setForm({ name: user.name, bio: user.bio || "", avatar: user.avatar || "" });
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    setError("");
    setSaving(true);
    const res = await fetch(`/api/users/${user.username}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      updateUser({ ...user, ...data.user });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError(data.error || "Failed to save");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile settings</h1>

      <div className="flex items-center gap-4 mb-8">
        <img src={form.avatar || user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
        <div>
          <p className="font-medium text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">@{user.username}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            rows={3}
            placeholder="Tell readers about yourself"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
          <input
            type="url"
            value={form.avatar}
            onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && <span className="text-sm text-brand-green">Saved!</span>}
        </div>
      </form>
    </div>
  );
}
