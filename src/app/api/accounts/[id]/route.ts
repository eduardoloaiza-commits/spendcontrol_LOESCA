import { NextResponse } from "next/server";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const Patch = z.object({
  name: z.string().min(1).optional(),
  kind: z.enum(["checking", "credit", "savings", "cash", "other", "fund"]).optional(),
  bank: z.preprocess(emptyToUndef, z.string().nullable().optional()),
  last4: z.preprocess(emptyToUndef, z.string().max(4).nullable().optional()),
  focus: z.preprocess(emptyToUndef, z.string().nullable().optional()),
  openingBalance: z.preprocess(emptyToUndef, z.coerce.number().int().optional()),
  monthlyTarget: z.preprocess(emptyToUndef, z.coerce.number().int().nonnegative().nullable().optional()),
  goalAmount: z.preprocess(emptyToUndef, z.coerce.number().int().nonnegative().nullable().optional()),
  goalDate: z.preprocess(emptyToUndef, z.coerce.date().nullable().optional()),
  archived: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { household } = await requireHousehold();
  const parsed = Patch.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const existing = await prisma.finAccount.findFirst({
    where: { id: params.id, householdId: household.id },
  });
  if (!existing) return NextResponse.json({ error: "not-found" }, { status: 404 });
  const updated = await prisma.finAccount.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { household } = await requireHousehold();
  const existing = await prisma.finAccount.findFirst({
    where: { id: params.id, householdId: household.id },
  });
  if (!existing) return NextResponse.json({ error: "not-found" }, { status: 404 });
  // Soft-delete: archivar para no romper transacciones existentes
  await prisma.finAccount.update({
    where: { id: params.id },
    data: { archived: true },
  });
  return NextResponse.json({ ok: true });
}
