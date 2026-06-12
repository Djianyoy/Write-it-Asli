import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { username: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      following: true,
      followers: true,
      _count: { select: { articles: { where: { status: "published" } } } },
    },
  });

  if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

  const { password: _pw, following, followers, _count, ...rest } = user;

  return NextResponse.json({
    user: {
      ...rest,
      following: following.map((f) => f.followingId),
      followers: followers.map((f) => f.followerId),
    },
    articleCount: _count.articles,
  });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const body = await req.json();

  const existing = await prisma.user.findUnique({ where: { username: params.username } });
  if (!existing) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

  const user = await prisma.user.update({
    where: { username: params.username },
    data: {
      name: body.name ?? existing.name,
      bio: body.bio ?? existing.bio,
      avatar: body.avatar ?? existing.avatar,
    },
  });

  const { password: _pw, ...safeUser } = user;
  return NextResponse.json({ user: safeUser });
}
