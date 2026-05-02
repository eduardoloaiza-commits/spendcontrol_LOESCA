import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const NEW_EMAIL = "eduardo.loaiza@gmail.com";
const NEW_PASSWORD = "12345678";
const NEW_NAME = "Eduardo Loaiza";
const OLD_EMAIL = "eduardo.loaiza@usatusubsidio.cl";

async function main() {
  const db = new PrismaClient();
  try {
    // 1) Crear o promover al nuevo admin.
    const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);
    const existingNew = await db.user.findUnique({ where: { email: NEW_EMAIL } });
    if (existingNew) {
      await db.user.update({
        where: { id: existingNew.id },
        data: { role: "admin", passwordHash, name: NEW_NAME },
      });
      console.log(`OK: ${NEW_EMAIL} promovido a admin (clave actualizada).`);
    } else {
      await db.user.create({
        data: { email: NEW_EMAIL, name: NEW_NAME, passwordHash, role: "admin" },
      });
      console.log(`OK: usuario admin ${NEW_EMAIL} creado.`);
    }

    // 2) Borrar el usuario anterior y sus datos asociados.
    const oldUser = await db.user.findUnique({
      where: { email: OLD_EMAIL },
      include: { households: { include: { household: true } } },
    });

    if (!oldUser) {
      console.log(`Nada que limpiar: ${OLD_EMAIL} no existe.`);
      return;
    }

    const householdIds = oldUser.households.map((m) => m.householdId);

    await db.user.delete({ where: { id: oldUser.id } });
    console.log(`OK: usuario ${OLD_EMAIL} eliminado.`);

    // 3) Borrar hogares que queden sin miembros (cascade limpia el resto).
    let removed = 0;
    for (const hhId of householdIds) {
      const remaining = await db.householdMember.count({ where: { householdId: hhId } });
      if (remaining === 0) {
        await db.household.delete({ where: { id: hhId } });
        removed++;
      }
    }
    if (removed > 0) console.log(`OK: ${removed} hogar(es) huérfano(s) eliminado(s).`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
