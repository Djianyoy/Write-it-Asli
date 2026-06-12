"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, MoreHorizontal, Trash2, Edit } from "lucide-react";
import type { ArticleWithAuthor } from "@/shared/types";
import { getExcerpt } from "@/features/articles/utils/articleUtils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Custom Clap icon since lucide doesn't have it
function ClapIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
      <path d="M14.5 2.5c0-1.1-.9-2-2-2s-2 .9-2 2v6.5l-1.5-2.6c-.55-.95-1.77-1.27-2.72-.72-.95.55-1.27 1.77-.72 2.72L9 14c0 3.87 3.13 7 7 7s7-3.13 7-7v-4c0-1.1-.9-2-2-2s-2 .9-2 2v-1c0-1.1-.9-2-2-2s-2 .9-2 2V2.5z" />
    </svg>
  );
}

interface ArticleCardProps {
  article: ArticleWithAuthor;
  onDelete?: (id: string) => void;
  showStatus?: boolean;
}

export default function ArticleCard({ article, onDelete, showStatus }: ArticleCardProps) {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [claps, setClaps] = useState(article.claps);
  const [clapped, setClapped] = useState(user ? article.clappedBy.includes(user.id) : false);
  const [bookmarked, setBookmarked] = useState(user ? user.bookmarkIds.includes(article.id) : false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = user?.id === article.authorId;

  const handleClap = async () => {
    if (!user) { router.push("/login"); return; }
    const res = await fetch(`/api/articles/${article.id}/clap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json();
    setClaps(data.claps);
    setClapped(data.clapped);
  };

  const handleBookmark = async () => {
    if (!user) { router.push("/login"); return; }
    const res = await fetch(`/api/articles/${article.id}/bookmark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json();
    setBookmarked(data.bookmarked);
    updateUser({ ...user, bookmarkIds: data.bookmarks });
  };

  const handleDelete = async () => {
    if (!confirm("Delete this article?")) return;
    await fetch(`/api/articles/${article.id}`, { method: "DELETE" });
    onDelete?.(article.id);
  };

  return (
    <article className="py-8 border-b border-gray-200 last:border-0">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {/* Author */}
          <div className="flex items-center gap-2 mb-3">
            <Link href={`/u/${article.author.username}`}>
              <img src={article.author.avatar} alt={article.author.name} className="w-6 h-6 rounded-full object-cover" />
            </Link>
            <Link href={`/u/${article.author.username}`} className="text-sm text-gray-700 hover:text-gray-900 font-medium">
              {article.author.name}
            </Link>
            {showStatus && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${article.status === "draft" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                {article.status}
              </span>
            )}
          </div>

          {/* Title & Subtitle */}
          <Link href={`/article/${article.slug}`}>
            <h2 className="text-xl font-bold text-gray-900 font-serif hover:text-gray-700 transition line-clamp-2 mb-1">
              {article.title}
            </h2>
            {article.subtitle && (
              <p className="text-gray-500 text-sm line-clamp-2 mb-3">{article.subtitle}</p>
            )}
            {!article.subtitle && (
              <p className="text-gray-500 text-sm line-clamp-2 mb-3">{getExcerpt(article.content)}</p>
            )}
          </Link>

          {/* Meta + Actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Tags */}
              {article.tags.slice(0, 2).map((tag) => (
                <Link
                  key={tag}
                  href={`/?tag=${encodeURIComponent(tag)}`}
                  className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1 rounded-full transition"
                >
                  {tag}
                </Link>
              ))}
              <span className="text-gray-400 text-xs">
                {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
              </span>
              <span className="text-gray-400 text-xs">{article.readingTime} min read</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleClap}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full hover:bg-gray-100 transition ${clapped ? "text-brand-green" : "text-gray-500"}`}
              >
                <ClapIcon filled={clapped} />
                {claps > 0 && <span>{claps}</span>}
              </button>

              <button
                onClick={handleBookmark}
                className={`p-1.5 rounded-full hover:bg-gray-100 transition ${bookmarked ? "text-brand-green" : "text-gray-400"}`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
              </button>

              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition text-gray-400"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {showMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1">
                        <button
                          onClick={() => { router.push(`/write/${article.id}`); setShowMenu(false); }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => { handleDelete(); setShowMenu(false); }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cover image */}
        {article.coverImage && (
          <Link href={`/article/${article.slug}`} className="shrink-0">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-28 h-20 md:w-40 md:h-28 object-cover rounded"
            />
          </Link>
        )}
      </div>
    </article>
  );
}
