"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ALL_TAGS } from "@/features/articles/utils/articleUtils";
import { X, Plus, Image as ImageIcon, Loader2 } from "lucide-react";

const RichTextEditor = dynamic(() => import("@/features/articles/components/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 border border-gray-200 rounded-lg animate-pulse" />,
});

export default function WritePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );
  };

  const save = async (status: "published" | "draft") => {
    if (!title.trim()) return alert("Title is required");
    setSaving(true);
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subtitle, content, coverImage, tags: selectedTags, status, authorId: user.id }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setSavedMessage(status === "published" ? "Published!" : "Draft saved.");
      setTimeout(() => {
        if (status === "published") router.push(`/article/${data.article.slug}`);
        else setSavedMessage("");
      }, 1500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-900 transition">
          ← Back
        </button>
        <div className="flex items-center gap-2">
          {savedMessage && <span className="text-sm text-brand-green">{savedMessage}</span>}
          <button
            onClick={() => save("draft")}
            disabled={saving}
            className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-1.5"
          >
            Save draft
          </button>
          <button
            onClick={() => save("published")}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm bg-brand-green text-white px-4 py-1.5 rounded-full hover:bg-brand-green-dark disabled:opacity-50 transition"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Publish
          </button>
        </div>
      </div>

      {/* Cover image */}
      <div className="mb-6">
        {coverImage ? (
          <div className="relative">
            <img src={coverImage} alt="Cover" className="w-full h-52 object-cover rounded-lg" />
            <button
              onClick={() => setCoverImage("")}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-400" />
            <input
              type="url"
              placeholder="Cover image URL (optional)"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="flex-1 text-sm text-gray-600 border-0 border-b border-gray-200 focus:outline-none focus:border-brand-green py-1 bg-transparent"
            />
          </div>
        )}
      </div>

      {/* Title */}
      <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        rows={2}
        className="w-full text-4xl font-serif font-bold text-gray-900 resize-none focus:outline-none placeholder-gray-300 mb-3 bg-transparent"
      />

      {/* Subtitle */}
      <textarea
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        placeholder="Add a subtitle…"
        rows={1}
        className="w-full text-xl font-serif text-gray-500 resize-none focus:outline-none placeholder-gray-300 mb-6 bg-transparent"
      />

      {/* Editor */}
      <RichTextEditor content={content} onChange={setContent} placeholder="Tell your story…" />

      {/* Tags */}
      <div className="mt-8">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Topics:</span>
          {selectedTags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              {tag}
              <button onClick={() => toggleTag(tag)} className="hover:text-red-500 transition">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedTags.length < 5 && (
            <button
              onClick={() => setShowTagPicker(!showTagPicker)}
              className="flex items-center gap-1 text-sm text-brand-green hover:bg-green-50 px-3 py-1 rounded-full transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add topic
            </button>
          )}
        </div>

        {showTagPicker && (
          <div className="mt-3 p-3 border border-gray-200 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-sm px-3 py-1 rounded-full border transition ${
                    selectedTags.includes(tag)
                      ? "border-brand-green bg-green-50 text-brand-green"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTagPicker(false)}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
