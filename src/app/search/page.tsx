"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ArticleCard from "@/features/articles/components/ArticleCard";
import type { ArticleWithAuthor } from "@/shared/types";
import { Search } from "lucide-react";

interface SearchUser {
  id: string; username: string; name: string; bio: string; avatar: string; followers: string[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q);
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [tab, setTab] = useState<"articles" | "people">("articles");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(q);
    if (!q) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        setArticles(data.articles || []);
        setUsers(data.users || []);
        setLoading(false);
      });
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Search input */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Medium"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
        </div>
      </form>

      {!q ? (
        <div className="text-center py-24 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Search for articles, writers, and topics</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
            {(["articles", "people"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 pb-3 text-sm font-medium border-b-2 capitalize transition ${tab === t ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {t} {t === "articles" ? `(${articles.length})` : `(${users.length})`}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Results for <strong className="text-gray-900">"{q}"</strong>
          </p>

          {loading ? (
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-200 rounded" />)}
            </div>
          ) : tab === "articles" ? (
            articles.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No articles found for "{q}"</p>
            ) : (
              articles.map((a) => <ArticleCard key={a.id} article={a} />)
            )
          ) : (
            users.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No writers found for "{q}"</p>
            ) : (
              <div className="space-y-4">
                {users.map((u) => (
                  <Link key={u.id} href={`/u/${u.username}`} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition">
                    <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{u.name}</p>
                      <p className="text-sm text-gray-500">@{u.username} · {u.followers?.length || 0} followers</p>
                      {u.bio && <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{u.bio}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
