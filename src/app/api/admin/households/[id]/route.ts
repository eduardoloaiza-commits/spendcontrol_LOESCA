import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  currency: z.string().trim().min(3).max(8).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const hh = await prisma.household.update({
    where: { id: params.id },
    data: parsed.data,
    select: { id: true, name: true, currency: true },
  });
  return NextResponse.json({ household: hh });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  await prisma.household.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
