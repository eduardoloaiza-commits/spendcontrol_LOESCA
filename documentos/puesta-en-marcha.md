# Puesta en marcha — SpendControl

Guía paso a paso para dejar SpendControl corriendo en **Vercel + Neon Postgres + Google OAuth**.

Repo: https://github.com/eduardoloaiza-commits/spendcontrol_LOESCA

---

## Resumen del stack en producción

| Capa | Servicio | Notas |
|---|---|---|
| Hosting Next.js | **Vercel** | Framework autodetectado |
| Base de datos | **Neon Postgres** (via Vercel Storage) | Plan Free alcanza para empezar |
| Auth | **NextAuth + Google OAuth** | Scopes: `openid email profile gmail.readonly` |
| Ingesta de gastos | **Gmail API** (readonly) | Via googleapis SDK |

---

## Paso 1 — Importar el repo en Vercel

1. Entra a <https://vercel.com/new>.
2. **Import Git Repository** → busca `spendcontrol_LOESCA` → **Import**.
3. Framework Preset: **Next.js** (autodetectado). No toques el build command.
4. Pulsa **Deploy**. Es esperable que el primer build **falle** porque aún no hay `DATABASE_URL`. Seguimos.

---

## Paso 2 — Crear la base Postgres (Neon)

1. Dentro del proyecto en Vercel → pestaña **Storage**.
2. **Create Database** → elige **Neon — Serverless Postgres**.
3. Nombre: `spendcontrol-db`. Región: la más cercana (ej. `iad1 / Washington D.C.`). Plan: **Free**.
4. **Create** → luego en el diálogo **Install Integration / Connect a Project**:
   - **Project:** `spendcontrol_loesca`.
   - **Environments:** marca los 3 (Development, Preview, Production).
   - **Create database branch for deployment:** deja **ambos desmarcados** (una sola base por ahora).
   - **Custom Prefix:** **déjalo vacío** (sin texto). Si pones prefijo las variables se llamarán `STORAGE_DATABASE_URL` y el código espera `DATABASE_URL` sin prefijo.
   - Pulsa **Connect / Install**.

Vercel inyectará automáticamente: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, etc.

---

## Paso 3 — Añadir `DIRECT_URL`

Prisma necesita una conexión directa (sin pooling) para aplicar el schema.

1. **Project → Settings → Environment Variables**.
2. Busca `DATABASE_URL_UNPOOLED` y copia su valor.
3. **Add New**:
   - Name: `DIRECT_URL`
   - Value: el valor copiado
   - Environments: los 3 marcados
4. **Save**.

Si `DATABASE_URL` no existe, créala manualmente con el valor de `POSTGRES_PRISMA_URL`.

---

## Paso 4 — Variables de NextAuth

En **Settings → Environment Variables** agrega:

| Name | Value |
|---|---|
| `NEXTAUTH_URL` | `https://<tu-proyecto>.vercel.app` (URL pública del deploy) |
| `NEXTAUTH_SECRET` | salida de `openssl rand -base64 32` |

Marca los tres environments en cada una.

---

## Paso 5 — Credenciales Google OAuth

1. <https://console.cloud.google.com/> → crea o elige un proyecto.
2. **APIs & Services → Enabled APIs** → habilita **Gmail API**.
3. **APIs & Services → OAuth consent screen**:
   - User Type: **External**.
   - Rellena nombre, email de soporte, dominio.
   - Scopes: agrega `https://www.googleapis.com/auth/gmail.readonly`.
   - Test users: agrega tu email (mientras la app esté en modo *Testing*).
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized redirect URIs**:
     - `https://<tu-proyecto>.vercel.app/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google`
5. Copia **Client ID** y **Client Secret** y agrégalos como variables en Vercel:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

---

## Paso 6 — Redeploy

1. Vercel → **Deployments** → último deploy → `···` → **Redeploy**.
2. **Desmarca** "Use existing build cache" → **Redeploy**.
3. El build correrá:
   ```
   prisma generate && prisma db push --accept-data-loss && next build
   ```
   Esto crea todas las tablas en Neon automáticamente.

---

## Paso 7 — Verificar end-to-end

1. Abre `https://<tu-proyecto>.vercel.app`.
2. **Entrar con Google** → autoriza (debe pedir permiso para Gmail).
3. Debería redirigirte a `/dashboard` con un hogar creado automáticamente.
4. **Cuentas** → crea una cuenta (ej. "Cuenta Corriente"). Si se guarda, la DB funciona.
5. **Categorías** → verifica que existan las default (Supermercado, Sueldo, etc.).
6. **Correo → Sincronizar** → debería escanear tus últimos correos bancarios y dejarlos en *pending*.
7. **Conciliar** → confirma o ignora los detectados.
8. **Resumen** → deberías ver los totales del mes.

---

## Desarrollo local (opcional)

```bash
git clone https://github.com/eduardoloaiza-commits/spendcontrol_LOESCA.git
cd spendcontrol_LOESCA
cp .env.example .env
# Completa DATABASE_URL, DIRECT_URL, GOOGLE_*, NEXTAUTH_SECRET
# Para DATABASE_URL puedes copiar la misma de Vercel (Neon)
npm install
npx prisma db push
npm run dev
# http://localhost:3000
```

**Tip:** añade `http://localhost:3000/api/auth/callback/google` en Google Cloud como redirect URI, y setea `NEXTAUTH_URL=http://localhost:3000` en tu `.env` local.

---

## Troubleshooting

| Síntoma | Causa probable | Fix |
|---|---|---|
| Build falla `P1001: can't reach database` | `DIRECT_URL` ausente o mal configurada | Copia `DATABASE_URL_UNPOOLED` a `DIRECT_URL` |
| `NEXTAUTH_URL is not set` en runtime | Falta variable | Agregar y redeploy |
| Google: `redirect_uri_mismatch` | URI en Google Cloud no coincide exactamente | Revisar: https, dominio exacto, sin `/` final |
| Login OK, sync falla con `insufficient scope` | Falta `gmail.readonly` en Consent Screen | Agregar scope y re-login (forzar consent) |
| Tablas no existen tras deploy | Build cache antigua | Redeploy sin cache |
| Variables con prefijo `STORAGE_*` | Pusiste Custom Prefix al conectar Neon | Desinstala integration y reconecta con prefix vacío |

---

## Rutas clave del proyecto

```
/                     Landing + login
/dashboard            KPIs del mes
/transactions         Listado + alta manual
/accounts             Cuentas bancarias / tarjetas / efectivo
/categories           Gestión de categorías
/reconcile            Conciliación de gastos detectados
/email                Estado Gmail + botón sincronizar
/settings             Sesión y hogar
/api/email/sync       POST — ingesta de correos bancarios
/api/auth/[...nextauth]  NextAuth handler
```

---

## Próximos hitos (post-MVP)

- [ ] Reglas automáticas (model `Rule`) para autocategorizar por merchant.
- [ ] Presupuestos mensuales por categoría.
- [ ] Invitar miembros al hogar (roles owner/editor/viewer ya existen).
- [ ] Gráficos recharts en dashboard.
- [ ] Sumar parsers de bancos: Itaú, Scotiabank, Falabella, Ripley.
- [ ] Notificaciones email/push cuando hay pendientes por conciliar.
- [ ] Dominio propio en Vercel.

---

*Documento v1 — 2026-04-14.*
