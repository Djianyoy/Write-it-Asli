"use client";

import { useState, useEffect } from "react";
import type { ArticleWithAuthor } from "@/shared/types";

export function useArticles(params?: { tag?: string; authorId?: string; status?: string }) {
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams();
    if (params?.tag) query.set("tag", params.tag);
    if (params?.authorId) query.set("authorId", params.authorId);
    if (params?.status) query.set("status", params.status);

    fetch(`/api/articles?${query.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load articles");
        setLoading(false);
      });
  }, [params?.tag, params?.authorId, params?.status]);

  return { articles, loading, error, setArticles };
}
