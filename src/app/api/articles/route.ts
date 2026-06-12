import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug, calculateReadingTime } from "@/features/articles/utils/articleUtils";
import { serializeArticle } from "@/features/articles/utils/serializers";

// Include relasi yang dibutuhkan serializeArticle
const articleInclude = {
  author: { include: { followers: true } },
  claps: true,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");
  const authorId = searchParams.get("authorId"); // bisa berupa id ATAU username
  const status = searchParams.get("status") || "published";

  // authorId boleh dikirim sebagai username (mis. dari halaman profil)
  let resolvedAuthorId: string | undefined;
  if (authorId) {
    const byId = await prisma.user.findUnique({ where: { id: authorId } });
    const user = byId || (await prisma.user.findUnique({ where: { username: authorId } }));
    resolvedAuthorId = user?.id || authorId;
  }

  const articles = await prisma.article.findMany({
    where: {
      ...(resolvedAuthorId
        ? {
            authorId: resolvedAuthorId,
            ...(status !== "all" ? { status } : {}),
          }
        : { status: "published" }),
      ...(tag ? { tags: { has: tag } } : {}),
    },
    include: articleInclude,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ articles: articles.map(serializeArticle) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, subtitle, content, coverImage, tags, status, authorId } = body;

  if (!title || !authorId) {
    return NextResponse.json({ error: "Title dan authorId wajib diisi" }, { status: 400 });
  }

  let slug = generateSlug(title);
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const article = await prisma.article.create({
    data: {
      slug,
      title,
      subtitle: subtitle || "",
      content: content || "",
      coverImage: coverImage || "",
      tags: tags || [],
      status: status || "published",
      readingTime: calculateReadingTime(content || ""),
      authorId,
    },
    include: articleInclude,
  });

  return NextResponse.json({ article: serializeArticle(article) }, { status: 201 });
}
