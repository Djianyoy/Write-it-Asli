"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
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
        <h1 className="text-3xl font-serif font-bold text-center text-gray-900 mb-2">Welcome back.</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Sign in to continue reading.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Demo accounts */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-600 mb-2">Demo accounts:</p>
          {[
            { email: "john@example.com", name: "John Doe" },
            { email: "jane@example.com", name: "Jane Doe" },
            { email: "alex@example.com", name: "Alex Smith" },
          ].map((acc) => (
            <button
              key={acc.email}
              onClick={() => { setEmail(acc.email); setPassword("password123"); }}
              className="block text-xs text-brand-green hover:underline mb-1"
            >
              {acc.name} — {acc.email}
            </button>
          ))}
          <p className="text-xs text-gray-400 mt-1">Password: password123</p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          No account?{" "}
          <Link href="/register" className="text-brand-green hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
