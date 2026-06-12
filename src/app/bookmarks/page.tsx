"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import ArticleCard from "@/features/articles/components/ArticleCard";
import type { ArticleWithAuthor } from "@/shared/types";
import { Bookmark } from "lucide-react";

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (!user) return;

    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => {
        const bookmarked = (data.articles || []).filter((a: ArticleWithAuthor) =>
          user.bookmarkIds.includes(a.id)
        );
        setArticles(bookmarked);
        setLoading(false);
      });
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Bookmark className="w-6 h-6 text-gray-700" />
        <h1 className="text-2xl font-bold text-gray-900">Your reading list</h1>
        <span className="text-gray-400 text-sm">({articles.length})</span>
      </div>

      {loading ? (
        <div className="space-y-8 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-8 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Nothing saved yet</p>
          <p className="text-sm mt-1">Bookmark articles to read them later.</p>
        </div>
      ) : (
        articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onDelete={(id) => setArticles((prev) => prev.filter((a) => a.id !== id))}
          />
        ))
      )}
    </div>
  );
}
