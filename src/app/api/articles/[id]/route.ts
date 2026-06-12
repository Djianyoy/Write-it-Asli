import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateReadingTime } from "@/features/articles/utils/articleUtils";
import { serializeArticle } from "@/features/articles/utils/serializers";

const articleInclude = {
  author: { include: { followers: true } },
  claps: true,
};

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  // params.id bisa berupa id artikel ATAU slug
  const article = await prisma.article.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: articleInclude,
  });

  if (!article) return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });

  return NextResponse.json({ article: serializeArticle(article) });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const body = await req.json();

  const existing = await prisma.article.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });

  const article = await prisma.article.update({
    where: { id: params.id },
    data: {
      title: body.title ?? existing.title,
      subtitle: body.subtitle ?? existing.subtitle,
      content: body.content ?? existing.content,
      coverImage: body.coverImage ?? existing.coverImage,
      tags: body.tags ?? existing.tags,
      status: body.status ?? existing.status,
      readingTime: calculateReadingTime(body.content ?? existing.content),
    },
    include: articleInclude,
  });

  return NextResponse.json({ article: serializeArticle(article) });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const existing = await prisma.article.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });

  await prisma.article.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
