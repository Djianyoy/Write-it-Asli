import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeAuthUser } from "@/features/articles/utils/serializers";

export async function POST(req: NextRequest) {
  const { name, username, email, password } = await req.json();
  if (!name || !username || !email || !password) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json({ error: "Email sudah digunakan" }, { status: 409 });
  }

  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    return NextResponse.json({ error: "Username sudah dipakai" }, { status: 409 });
  }

  // NOTE: Untuk produksi gunakan bcrypt.hash(password, 10) sebelum disimpan.
  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      password,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a8917&color=fff&size=128`,
    },
    include: { following: true, followers: true, bookmarks: true },
  });

  return NextResponse.json({ user: serializeAuthUser(user) }, { status: 201 });
}
