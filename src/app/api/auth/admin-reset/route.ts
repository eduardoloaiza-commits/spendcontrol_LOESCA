import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(1),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
  name: z.string().trim().min(1).max(80).optional(),
  createIfMissing: z.boolean().default(false),
  promoteAdmin: z.boolean().default(false),
});

function tokensMatch(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(req: Request) {
  const expected = process.env.ADMIN_RESET_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_RESET_TOKEN no está configurado en el servidor" },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { token, email, password, name, createIfMissing, promoteAdmin } = parsed.data;

  if (!tokensMatch(token, expected)) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await bcrypt.hash(password, 10);

  if (!user) {
    if (!createIfMissing) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    const created = await prisma.user.create({
      data: {
        email,
        name: name ?? null,
        passwordHash,
        role: promoteAdmin ? "admin" : "user",
      },
      select: { id: true, email: true, role: true },
    });
    return NextResponse.json({ ok: true, action: "created", user: created });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      ...(name ? { name } : {}),
      ...(promoteAdmin ? { role: "admin" } : {}),
    },
  });
  return NextResponse.json({
    ok: true,
    action: promoteAdmin ? "updated_and_promoted" : "updated",
  });
}
