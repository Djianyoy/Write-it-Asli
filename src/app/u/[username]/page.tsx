"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { ArticleWithAuthor } from "@/shared/types";
import { useAuth } from "@/features/auth/hooks/useAuth";
import ArticleCard from "@/features/articles/components/ArticleCard";

interface ProfileUser {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar: string;
  following: string[];
  followers: string[];
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);
  const [drafts, setDrafts] = useState<ArticleWithAuthor[]>([]);
  const [tab, setTab] = useState<"published" | "drafts">("published");
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isOwn = currentUser?.username === username;

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setProfile(data.user);
          setFollowerCount(data.user.followers?.length || 0);
          if (currentUser) setFollowing(data.user.followers?.includes(currentUser.id) || false);
        }
        setLoading(false);
      });

    // Load published
    fetch(`/api/articles?authorId=${encodeURIComponent(username)}&status=published`)
      .then((r) => r.json())
      .then((data) => setArticles(data.articles || []));
  }, [username, currentUser]);

  useEffect(() => {
    if (isOwn && profile) {
      fetch(`/api/articles?authorId=${profile.id}&status=draft`)
        .then((r) => r.json())
        .then((data) => setDrafts(data.articles || []));
    }
  }, [isOwn, profile]);

  const handleFollow = async () => {
    if (!currentUser || !profile) return;
    const res = await fetch(`/api/users/${username}/follow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id }),
    });
    const data = await res.json();
    setFollowing(data.following);
    setFollowerCount(data.followerCount);
  };

  const handleDelete = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setDrafts((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
      <div className="flex gap-4 mb-8">
        <div className="w-20 h-20 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-40" />
          <div className="h-4 bg-gray-200 rounded w-64" />
        </div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <p className="text-gray-500">User not found.</p>
    </div>
  );

  const displayArticles = tab === "published" ? articles : drafts;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-10 pb-10 border-b border-gray-200">
        <img src={profile.avatar} alt={profile.name} className="w-20 h-20 rounded-full object-cover shrink-0" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h1>
          <p className="text-gray-500 text-sm mb-3">@{profile.username}</p>
          {profile.bio && <p className="text-gray-700 mb-3">{profile.bio}</p>}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span><strong className="text-gray-900">{followerCount}</strong> Followers</span>
            <span><strong className="text-gray-900">{profile.following?.length || 0}</strong> Following</span>
            <span><strong className="text-gray-900">{articles.length}</strong> Stories</span>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {isOwn ? (
              <Link href="/settings" className="text-sm border border-gray-300 rounded-full px-4 py-1.5 text-gray-700 hover:border-gray-600 transition">
                Edit profile
              </Link>
            ) : currentUser ? (
              <button
                onClick={handleFollow}
                className={`text-sm px-4 py-1.5 rounded-full border transition ${following ? "border-gray-300 text-gray-600 hover:bg-gray-50" : "border-brand-green bg-brand-green text-white hover:bg-brand-green-dark"}`}
              >
                {following ? "Following" : "Follow"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab("published")}
          className={`pb-3 px-1 mr-6 text-sm font-medium border-b-2 transition ${tab === "published" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Published ({articles.length})
        </button>
        {isOwn && (
          <button
            onClick={() => setTab("drafts")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition ${tab === "drafts" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Drafts ({drafts.length})
          </button>
        )}
      </div>

      {displayArticles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>{tab === "published" ? "No published stories yet." : "No drafts yet."}</p>
          {isOwn && (
            <Link href="/write" className="mt-2 text-sm text-brand-green hover:underline inline-block">
              Start writing
            </Link>
          )}
        </div>
      ) : (
        displayArticles.map((article) => (
          <ArticleCard key={article.id} article={article} onDelete={handleDelete} showStatus={tab === "drafts"} />
        ))
      )}
    </div>
  );
}
