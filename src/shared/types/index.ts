// Shared TypeScript types
// Catatan: tipe inti (User, Article, dll) sebenarnya digenerate otomatis
// oleh Prisma Client dari prisma/schema.prisma. Tipe di file ini adalah
// tipe "view"/DTO yang dikembalikan oleh API routes ke frontend
// (password sudah dihapus, dsb).

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  bio: string;
  avatar: string;
  followingIds: string[];   // id user yang di-follow oleh user ini
  followerIds: string[];    // id user yang follow user ini
  bookmarkIds: string[];    // id artikel yang dibookmark user ini
}

export interface SafeUser {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar: string;
  followerCount: number;
  followingCount: number;
}

export interface ArticleWithAuthor {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  coverImage: string;
  tags: string[];
  status: "published" | "draft";
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  claps: number;        // total clap count
  clappedBy: string[];  // array of userIds yang sudah clap (untuk cek status di UI)
  author: SafeUser & { followers: string[] }; // followers: array userId (untuk cek "following" status)
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  coverImage: string;
  authorId: string;
  tags: string[];
  status: "published" | "draft";
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}
