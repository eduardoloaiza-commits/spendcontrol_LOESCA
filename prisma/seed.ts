import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const DEFAULT_CATEGORIES: { name: string; kind: "expense" | "income"; color: string }[] = [
  { name: "Supermercado", kind: "expense", color: "#1E40FF" },
  { name: "Comida fuera", kind: "expense", color: "#FF5A4E" },
  { name: "Transporte", kind: "expense", color: "#FFB020" },
  { name: "Arriendo/Dividendo", kind: "expense", color: "#6366F1" },
  { name: "Servicios básicos", kind: "expense", color: "#0EA5E9" },
  { name: "Salud", kind: "expense", color: "#EF4444" },
  { name: "Educación", kind: "expense", color: "#8B5CF6" },
  { name: "Suscripciones", kind: "expense", color: "#EC4899" },
  { name: "Sueldo", kind: "income", color: "#00E28A" },
  { name: "Otros ingresos", kind: "income", color: "#10B981" },
];

async function main() {
  const user = await db.user.upsert({
    where: { email: "demo@spendcontrol.local" },
    update: {},
    create: { email: "demo@spendcontrol.local", name: "Demo" },
  });
  const hh = await db.household.create({
    data: { name: "Familia Demo", currency: "CLP" },
  });
  await db.householdMember.create({
    data: { userId: user.id, householdId: hh.id, role: "owner" },
  });
  for (const c of DEFAULT_CATEGORIES) {
    await db.category.create({ data: { ...c, householdId: hh.id } });
  }
  await db.finAccount.create({
    data: { householdId: hh.id, name: "Cuenta Corriente", kind: "checking", bank: "Banco Demo", last4: "1234" },
  });
  console.log("Seed listo. Household:", hh.id);
}

main().finally(() => db.$disconnect());
