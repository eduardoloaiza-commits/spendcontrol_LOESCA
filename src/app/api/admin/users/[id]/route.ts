import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(80).nullable().optional(),
  role: z.enum(["admin", "user"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (parsed.data.role && parsed.data.role !== "admin" && params.id === guard.user.id) {
    return NextResponse.json(
      { error: "No puedes quitarte tu propio rol de admin" },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json({ user });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  if (params.id === guard.user.id) {
    return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
