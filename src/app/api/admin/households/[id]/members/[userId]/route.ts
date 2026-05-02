import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

const patchSchema = z.object({
  role: z.enum(["owner", "editor", "viewer"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; userId: string } },
) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const member = await prisma.householdMember.update({
    where: { userId_householdId: { userId: params.userId, householdId: params.id } },
    data: { role: parsed.data.role },
    select: {
      id: true,
      role: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ member });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; userId: string } },
) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  await prisma.householdMember.delete({
    where: { userId_householdId: { userId: params.userId, householdId: params.id } },
  });
  return NextResponse.json({ ok: true });
}
