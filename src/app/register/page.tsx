"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-serif font-bold text-center text-gray-900 mb-2">Join WriteIt.</h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Create an account to start reading and writing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {(["name", "username", "email", "password"] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field === "name" ? "Full Name" : field}
              </label>
              <input
                type={field === "email" ? "email" : field === "password" ? "password" : "text"}
                value={form[field]}
                onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                placeholder={
                  field === "name" ? "Your full name"
                  : field === "username" ? "yourhandle"
                  : field === "email" ? "you@example.com"
                  : "At least 6 characters"
                }
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-green hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
