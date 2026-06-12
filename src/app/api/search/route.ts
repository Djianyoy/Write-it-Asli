import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeArticle } from "@/features/articles/utils/serializers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q) return NextResponse.json({ articles: [], users: [] });

  const articles = await prisma.article.findMany({
    where: {
      status: "published",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { subtitle: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ],
    },
    include: { author: { include: { followers: true } }, claps: true },
    orderBy: { createdAt: "desc" },
  });

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { followers: true },
  });

  return NextResponse.json({
    articles: articles.map(serializeArticle),
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      bio: u.bio,
      avatar: u.avatar,
      followers: u.followers.map((f) => f.followerId),
    })),
  });
}
