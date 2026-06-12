import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId wajib diisi" }, { status: 400 });

  const articleId = params.id;

  const existing = await prisma.bookmark.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
  } else {
    await prisma.bookmark.create({ data: { userId, articleId } });
  }

  const bookmarks = await prisma.bookmark.findMany({ where: { userId } });

  return NextResponse.json({
    bookmarked: !existing,
    bookmarks: bookmarks.map((b) => b.articleId),
  });
}
