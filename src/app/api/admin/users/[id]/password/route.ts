import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

const schema = z.object({
  password: z.string().min(8).max(200),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Clave inválida (mín. 8 caracteres)" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({ where: { id: params.id }, data: { passwordHash } });
  return NextResponse.json({ ok: true });
}
