"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { Bookmark, Share2, Twitter, Link as LinkIcon, UserPlus, UserCheck } from "lucide-react";
import type { ArticleWithAuthor } from "@/shared/types";
import { useAuth } from "@/features/auth/hooks/useAuth";

function ClapButton({ articleId, initialClaps, clappedBy }: { articleId: string; initialClaps: number; clappedBy: string[] }) {
  const { user } = useAuth();
  const router = useRouter();
  const [claps, setClaps] = useState(initialClaps);
  const [clapped, setClapped] = useState(user ? clappedBy.includes(user.id) : false);

  const handleClap = async () => {
    if (!user) { router.push("/login"); return; }
    const res = await fetch(`/api/articles/${articleId}/clap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json();
    setClaps(data.claps);
    setClapped(data.clapped);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleClap}
        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition ${clapped ? "border-brand-green text-brand-green" : "border-gray-300 text-gray-400 hover:border-gray-600"}`}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill={clapped ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
          <path d="M14.5 2.5c0-1.1-.9-2-2-2s-2 .9-2 2v6.5l-1.5-2.6c-.55-.95-1.77-1.27-2.72-.72-.95.55-1.27 1.77-.72 2.72L9 14c0 3.87 3.13 7 7 7s7-3.13 7-7v-4c0-1.1-.9-2-2-2s-2 .9-2 2v-1c0-1.1-.9-2-2-2s-2 .9-2 2V2.5z" />
        </svg>
      </button>
      <span className="text-xs text-gray-500">{claps}</span>
    </div>
  );
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [article, setArticle] = useState<ArticleWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    fetch(`/api/articles/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.article) {
          setArticle(data.article);
          setFollowerCount(data.article.author.followerCount || 0);
          if (user) {
            setBookmarked(user.bookmarkIds.includes(data.article.id));
            setFollowing(data.article.author.followers?.includes(user.id) || false);
          }
        }
        setLoading(false);
      });
  }, [slug, user]);

  const handleBookmark = async () => {
    if (!user || !article) { router.push("/login"); return; }
    const res = await fetch(`/api/articles/${article.id}/bookmark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json();
    setBookmarked(data.bookmarked);
    updateUser({ ...user, bookmarkIds: data.bookmarks });
  };

  const handleFollow = async () => {
    if (!user || !article) { router.push("/login"); return; }
    const res = await fetch(`/api/users/${article.author.username}/follow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json();
    setFollowing(data.following);
    setFollowerCount(data.followerCount);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShare(false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="flex gap-3 my-6">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Article not found</h1>
        <Link href="/" className="text-brand-green hover:underline">Go home</Link>
      </div>
    );
  }

  const isOwner = user?.id === article.authorId;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Title */}
      <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3 leading-tight">{article.title}</h1>
      {article.subtitle && (
        <p className="text-xl text-gray-500 mb-6 font-serif">{article.subtitle}</p>
      )}

      {/* Author row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/u/${article.author.username}`}>
            <img src={article.author.avatar} alt={article.author.name} className="w-10 h-10 rounded-full object-cover" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/u/${article.author.username}`} className="text-sm font-medium text-gray-900 hover:underline">
                {article.author.name}
              </Link>
              {!isOwner && (
                <button
                  onClick={handleFollow}
                  className={`text-xs px-2 py-0.5 rounded-full border transition ${following ? "border-gray-300 text-gray-600" : "border-brand-green text-brand-green hover:bg-green-50"}`}
                >
                  {following ? "Following" : "Follow"}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{article.readingTime} min read</span>
              <span>·</span>
              <span>{format(new Date(article.createdAt), "MMM d, yyyy")}</span>
              <span>·</span>
              <span>{followerCount} followers</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full hover:bg-gray-100 transition ${bookmarked ? "text-brand-green" : "text-gray-400"}`}
          >
            <Bookmark className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowShare(!showShare)}
              className="p-2 rounded-full hover:bg-gray-100 transition text-gray-400"
            >
              <Share2 className="w-5 h-5" />
            </button>
            {showShare && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowShare(false)} />
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1">
                  <button onClick={copyLink} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                    <LinkIcon className="w-4 h-4" /> Copy link
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <Twitter className="w-4 h-4" /> Share on X
                  </a>
                </div>
              </>
            )}
          </div>

          {isOwner && (
            <button
              onClick={() => router.push(`/write/${article.id}`)}
              className="text-xs px-3 py-1.5 border border-gray-300 rounded-full text-gray-600 hover:border-gray-600 transition"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Cover image */}
      {article.coverImage && (
        <img src={article.coverImage} alt={article.title} className="w-full rounded-lg mb-8 object-cover max-h-96" />
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {article.tags.map((tag) => (
          <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}`}
            className="text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-1.5 rounded-full transition">
            {tag}
          </Link>
        ))}
      </div>

      {/* Content */}
      <div
        className="prose prose-lg max-w-none font-serif text-gray-900"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Footer clap */}
      <div className="mt-12 pt-8 border-t border-gray-200 flex items-center gap-6">
        <ClapButton articleId={article.id} initialClaps={article.claps} clappedBy={article.clappedBy} />
        <div className="flex items-center gap-3">
          <img src={article.author.avatar} alt="" className="w-12 h-12 rounded-full" />
          <div>
            <p className="text-sm font-medium text-gray-900">{article.author.name}</p>
            <p className="text-sm text-gray-500 line-clamp-2">{article.author.bio || "Writer on Medium."}</p>
            {!isOwner && (
              <button
                onClick={handleFollow}
                className={`mt-1 text-xs px-3 py-1 rounded-full border transition ${following ? "border-gray-300 text-gray-600" : "border-brand-green text-brand-green hover:bg-green-50"}`}
              >
                {following ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
