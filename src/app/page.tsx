"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ArticleCard from "@/features/articles/components/ArticleCard";
import type { ArticleWithAuthor } from "@/shared/types";
import { ALL_TAGS } from "@/features/articles/utils/articleUtils";
import { TrendingUp } from "lucide-react";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTag = searchParams.get("tag") || "";

  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);
  const [trending, setTrending] = useState<ArticleWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const query = activeTag ? `?tag=${encodeURIComponent(activeTag)}` : "";
    fetch(`/api/articles${query}`)
      .then((r) => r.json())
      .then((data) => {
        setArticles(data.articles || []);
        setLoading(false);
      });
  }, [activeTag]);

  useEffect(() => {
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => {
        const sorted = [...(data.articles || [])].sort((a, b) => b.claps - a.claps);
        setTrending(sorted.slice(0, 5));
      });
  }, []);

  const handleDelete = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-12">
        {/* Main feed */}
        <div className="flex-1 min-w-0">
          {/* Tag filter bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-gray-200 scrollbar-hide">
            <button
              onClick={() => router.push("/")}
              className={`shrink-0 text-sm px-4 py-2 rounded-full border transition ${!activeTag ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
            >
              For you
            </button>
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(`/?tag=${encodeURIComponent(tag)}`)}
                className={`shrink-0 text-sm px-4 py-2 rounded-full border transition ${activeTag === tag ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
              >
                {tag}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse py-8 border-b border-gray-200">
                  <div className="flex gap-3 mb-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <p className="text-lg font-medium">No articles found</p>
              <p className="text-sm mt-1">
                {activeTag ? `No articles tagged "${activeTag}" yet.` : "Be the first to write one!"}
              </p>
            </div>
          ) : (
            <div>
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block w-80 shrink-0">
          {/* Trending */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-gray-700" />
              <h3 className="font-bold text-gray-900">Trending on WriteIt</h3>
            </div>
            <div className="space-y-4">
              {trending.map((article, i) => (
                <div key={article.id} className="flex gap-4">
                  <span className="text-2xl font-bold text-gray-200 leading-none w-6 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <img src={article.author.avatar} alt="" className="w-4 h-4 rounded-full" />
                      <span className="text-xs text-gray-600 font-medium">{article.author.name}</span>
                    </div>
                    <a href={`/article/${article.slug}`} className="text-sm font-bold text-gray-900 hover:text-gray-600 line-clamp-2">
                      {article.title}
                    </a>
                    <p className="text-xs text-gray-400 mt-1">{article.readingTime} min read</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Recommended topics</h3>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.slice(0, 12).map((tag) => (
                <a
                  key={tag}
                  href={`/?tag=${encodeURIComponent(tag)}`}
                  className="text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-1.5 rounded-full transition"
                >
                  {tag}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}


export default function HomePage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-8 text-gray-400 text-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
