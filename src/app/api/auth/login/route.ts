import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeAuthUser } from "@/features/articles/utils/serializers";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { following: true, followers: true, bookmarks: true },
  });

  // NOTE: Untuk produksi, password harus di-hash (bcrypt) saat register
  // dan dibandingkan dengan bcrypt.compare() di sini, bukan plain text.
  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
  }

  return NextResponse.json({ user: serializeAuthUser(user) });
}
