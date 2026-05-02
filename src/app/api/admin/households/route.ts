import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  currency: z.string().trim().min(3).max(8).default("CLP"),
  seedCategories: z.boolean().default(true),
});

const DEFAULT_CATEGORIES = [
  { name: "Supermercado", kind: "expense", color: "#1E40FF" },
  { name: "Comida fuera", kind: "expense", color: "#FF5A4E" },
  { name: "Transporte", kind: "expense", color: "#FFB020" },
  { name: "Servicios", kind: "expense", color: "#0EA5E9" },
  { name: "Sueldo", kind: "income", color: "#00E28A" },
];

export async function GET() {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const households = await prisma.household.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      currency: true,
      createdAt: true,
      members: {
        select: {
          id: true,
          role: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      _count: { select: { transactions: true, finAccounts: true } },
    },
  });
  return NextResponse.json({ households });
}

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { name, currency, seedCategories } = parsed.data;

  const hh = await prisma.household.create({
    data: {
      name,
      currency,
      ...(seedCategories ? { categories: { create: DEFAULT_CATEGORIES } } : {}),
    },
    select: { id: true, name: true, currency: true },
  });
  return NextResponse.json({ household: hh }, { status: 201 });
}
