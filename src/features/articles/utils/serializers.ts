import type { Article, User, Clap, Bookmark, Follow } from "@prisma/client";

// Tipe Article dari Prisma beserta semua relasi yang kita butuhkan
// untuk dirender di frontend (author + claps + bookmarks)
type ArticleWithRelations = Article & {
  author: User & {
    followers: Follow[]; // daftar follower si author (relasi UserFollowers)
  };
  claps: Clap[];
  bookmarks?: Bookmark[];
};

/**
 * Ubah Article (hasil query Prisma) menjadi bentuk JSON yang aman
 * untuk dikirim ke client (tanpa password, dengan field turunan
 * seperti `claps` (jumlah) dan `clappedBy` (array userId)).
 */
export function serializeArticle(article: ArticleWithRelations) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    content: article.content,
    coverImage: article.coverImage,
    tags: article.tags,
    status: article.status,
    readingTime: article.readingTime,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    authorId: article.authorId,
    claps: article.claps?.length || 0,
    clappedBy: article.claps?.map((c) => c.userId) || [],
    author: {
      id: article.author.id,
      username: article.author.username,
      name: article.author.name,
      bio: article.author.bio,
      avatar: article.author.avatar,
      followerCount: article.author.followers?.length || 0,
      followingCount: 0,
      followers: article.author.followers?.map((f) => f.followerId) || [],
    },
  };
}

/**
 * Ubah User (hasil query Prisma) menjadi AuthUser yang aman
 * untuk disimpan di localStorage/context di client.
 */
export function serializeAuthUser(
  user: User & {
    following?: Follow[];
    followers?: Follow[];
    bookmarks?: Bookmark[];
  }
) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    bio: user.bio,
    avatar: user.avatar,
    followingIds: user.following?.map((f) => f.followingId) || [],
    followerIds: user.followers?.map((f) => f.followerId) || [],
    bookmarkIds: user.bookmarks?.map((b) => b.articleId) || [],
  };
}
