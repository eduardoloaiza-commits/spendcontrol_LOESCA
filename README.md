# SpendControl

Plataforma minimalista para el control de gasto familiar. Conecta tu correo (Gmail), detecta notificaciones bancarias y te permite conciliarlas contra cuentas que definas.

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind · Prisma · PostgreSQL · NextAuth (Google) · Gmail API**.

---

## Puesta en marcha

```bash
cd SpendControl
cp .env.example .env       # completa DATABASE_URL (Postgres) + Google creds
npm install
npx prisma db push          # aplica el schema a tu Postgres
npm run dev                 # http://localhost:3000
```

## Deploy en Vercel

1. **Importa el repo** en Vercel.
2. **Crea Vercel Postgres** (Storage → Create → Postgres) y conéctalo al proyecto; Vercel inyecta `POSTGRES_PRISMA_URL` y `POSTGRES_URL_NON_POOLING`.
3. **Variables de entorno** adicionales:
   - `DATABASE_URL` = valor de `POSTGRES_PRISMA_URL`
   - `DIRECT_URL` = valor de `POSTGRES_URL_NON_POOLING`
   - `NEXTAUTH_URL` = URL pública del deploy (ej. `https://spendcontrol-loesca.vercel.app`)
   - `NEXTAUTH_SECRET` = `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
4. **Google OAuth:** agrega el redirect URI `https://<tu-dominio>/api/auth/callback/google` en Google Cloud Console.
5. **Deploy.** El script de build corre `prisma generate && prisma db push && next build`, dejando el schema aplicado automáticamente.

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
