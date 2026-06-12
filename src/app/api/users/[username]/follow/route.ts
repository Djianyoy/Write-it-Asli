import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { username: string } }) {
  const { userId } = await req.json(); // id user yang melakukan follow (follower)
  if (!userId) return NextResponse.json({ error: "userId wajib diisi" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { username: params.username } });
  if (!target) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

  if (target.id === userId) {
    return NextResponse.json({ error: "Tidak bisa follow diri sendiri" }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: userId, followingId: target.id } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({ data: { followerId: userId, followingId: target.id } });
  }

  const followerCount = await prisma.follow.count({ where: { followingId: target.id } });

  return NextResponse.json({ following: !existing, followerCount });
}
