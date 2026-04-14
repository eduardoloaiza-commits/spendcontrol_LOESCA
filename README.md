# SpendControl

Plataforma minimalista para el control de gasto familiar. Conecta tu correo (Gmail), detecta notificaciones bancarias y te permite conciliarlas contra cuentas que definas.

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind · Prisma · SQLite · NextAuth (Google) · Gmail API**.

---

## Puesta en marcha

```bash
cd SpendControl
cp .env.example .env       # completa GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET
npm install
npx prisma db push          # crea la DB local (SQLite en ./dev.db)
npm run dev                 # http://localhost:3000
```

### Credenciales Google

1. Google Cloud Console → crea OAuth Client (Web).
2. Redirect URI: `http://localhost:3000/api/auth/callback/google`.
3. Habilita **Gmail API** y agrega el scope `https://www.googleapis.com/auth/gmail.readonly` en la OAuth consent screen.
4. Copia client id y secret al `.env`.

---

## Estructura

```
documentos/           Manual de marca (v1)
prisma/               Esquema + seed
src/app/              Rutas (landing, app autenticada, API)
src/components/       UI + navegación
src/lib/              Prisma, auth, helpers, Gmail, parsers
```

## Modelos principales

- **Household**: hogar familiar; todo dato cuelga de acá.
- **HouseholdMember**: usuarios que acceden al hogar (roles).
- **FinAccount**: cuentas bancarias / tarjetas / efectivo.
- **Category**: categorías (gasto / ingreso / transferencia).
- **Transaction**: movimiento (manual, email o import). Estado pending / confirmed / ignored.
- **EmailSource + EmailMessage**: bandeja de correos escaneados.
- **Rule**: reglas para autocategorizar (hook listo, lógica futura).

## Flujo

1. Usuario entra con Google (scopes Gmail readonly).
2. Crea cuentas y categorías.
3. En **Correo → Sincronizar** ejecutamos `/api/email/sync`: consultamos Gmail con un query de notificaciones bancarias chilenas, parseamos montos/merchant con parsers stub (`src/lib/email/parsers`), y creamos transacciones `pending`.
4. En **Conciliar**, el usuario asigna cuenta + categoría y confirma (o ignora).
5. **Resumen** muestra ingresos/gastos del mes, top categorías y últimos movimientos.

## Extender los parsers

Los parsers viven en `src/lib/email/parsers/index.ts`. Cada uno recibe `{ from, subject, snippet }` y retorna `{ bank, amount, merchant?, last4? }` o `null`. Para agregar bancos: añadir función al array `parsers` — el primero que matchee gana.

## Próximos pasos sugeridos

- Reglas automáticas (Rule model) para autocategorizar por merchant.
- Presupuestos mensuales por categoría.
- Invitar miembros al hogar.
- Gráficos recharts en dashboard.
- Soporte multi-moneda y montos en centavos.
- Migrar a PostgreSQL para producción.
