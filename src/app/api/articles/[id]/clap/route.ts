import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId wajib diisi" }, { status: 400 });

  const articleId = params.id;

  const existingClap = await prisma.clap.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });

  if (existingClap) {
    // Sudah pernah clap -> hapus (un-clap)
    await prisma.clap.delete({ where: { id: existingClap.id } });
  } else {
    // Belum clap -> buat clap baru
    await prisma.clap.create({ data: { userId, articleId } });
  }

  const totalClaps = await prisma.clap.count({ where: { articleId } });

  return NextResponse.json({ claps: totalClaps, clapped: !existingClap });
}
