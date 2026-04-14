# Manual de Marca — SpendControl

> Plataforma minimalista, tecnológica y cercana para el control del gasto familiar.

---

## 1. Esencia de marca

**Nombre:** SpendControl
**Categoría:** Fintech personal / organización de gastos familiares
**Promesa:** "Entiende a dónde va tu dinero, sin complicarte."
**Personalidad:** Minimalista · Tecnológica · Confiable · Clara · Amigable
**Lo que NO es:** No es un ERP, no es software contable corporativo, no es un asesor financiero. Es una herramienta doméstica, diaria, accesible.

### Tono de voz
- **Claro antes que técnico.** "Gastaste $250.000 en comida este mes" > "Egreso categoría alimentación 250000 CLP".
- **Breve.** Frases cortas, números grandes, cero jerga bancaria.
- **Respetuoso con el dinero del usuario.** Nunca juzga gastos; sólo informa y organiza.
- **Segunda persona (tú).** Cercano, nunca paternalista.

---

## 2. Identidad visual

### 2.1 Paleta de color

| Rol | Nombre | HEX | Uso |
|---|---|---|---|
| Primario | Ink Black | `#0A0A0A` | Textos principales, logotipo en claro |
| Primario | Pure White | `#FFFFFF` | Fondos, superficies |
| Acento | Electric Mint | `#00E28A` | Ingresos, confirmaciones, CTA positivos |
| Acento | Signal Coral | `#FF5A4E` | Gastos, alertas, sobregiros |
| Neutro | Graphite | `#1C1F24` | Dark mode surface |
| Neutro | Mist | `#F4F5F7` | Fondos secundarios, tarjetas |
| Neutro | Silver | `#D9DCE1` | Bordes, divisores |
| Neutro | Slate | `#6B7280` | Texto secundario, labels |
| Dato | Deep Blue | `#1E40FF` | Gráficos, links, categorías neutrales |

**Reglas:**
- Fondo por defecto: **blanco puro** (claro) o **graphite** (oscuro). Nada de grises "creativos".
- Nunca usar mint y coral en el mismo componente salvo en contraposición semántica (ingreso vs gasto).
- Contraste mínimo AA en todo texto (4.5:1).

### 2.2 Tipografía

- **Display & UI:** `Inter` (400, 500, 600, 700) — numerales tabulares activados (`font-feature-settings: "tnum"`).
- **Números / dashboards:** `JetBrains Mono` (500) para montos grandes cuando se busque carácter tecnológico.
- **Fallback sistema:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.

**Escala (rem):**
`Display 3.0 / H1 2.25 / H2 1.75 / H3 1.25 / Body 1.0 / Small 0.875 / Micro 0.75`
Line-height: 1.2 titulares, 1.5 cuerpo.

### 2.3 Logotipo

- Wordmark **"spendcontrol"** en minúsculas, Inter 700, tracking -2%.
- Símbolo opcional: círculo con un segmento de dona abierto (metáfora de "presupuesto restante").
- Espacio de respeto: altura de la "o" a cada lado.
- Tamaño mínimo digital: 88px ancho.
- Versiones: full color sobre blanco, blanco sobre graphite, monocromo negro.

### 2.4 Iconografía
- Stroke 1.5px, esquinas redondeadas 2px.
- Librería base recomendada: **Lucide** o **Phosphor (regular)**.
- Sin iconos decorativos en listados densos de transacciones.

### 2.5 Layout y espaciado
- Grid base 8px. Radios 12px (tarjetas), 8px (inputs), 999px (chips/categorías).
- Sombra única: `0 1px 2px rgba(10,10,10,0.04), 0 4px 16px rgba(10,10,10,0.06)`.
- Densidad: máximo 3 niveles jerárquicos visibles por pantalla.

### 2.6 Data viz
- Una categoría = un color. Paleta extendida de 8 tonos derivados de Deep Blue rotando en HSL.
- Ingresos siempre en mint, gastos siempre en coral en gráficos comparativos.
- Sin gradientes en gráficos financieros.

---

## 3. Principios de producto (brand-in-UX)

1. **El número manda.** El monto siempre es el elemento más grande de la pantalla.
2. **Una acción por pantalla.** Conciliar, categorizar, crear cuenta: una cosa a la vez.
3. **Cero fricción en lo rutinario.** Importar correo → sugerencia automática → un tap para confirmar.
4. **Privacidad visible.** Cada conexión de correo debe mostrar qué se lee y qué no.
5. **Familia, no individuo.** Todo puede compartirse entre miembros con roles.

---

## 4. Aplicaciones

- **App / Web:** Interfaz clara, blanco dominante, acentos de color sólo para datos.
- **Email transaccional:** Fondo blanco, un único color de acento por tipo (mint confirmación, coral alerta).
- **Redes:** Fondos lisos, un dato por pieza, tipografía grande.
- **Evitar:** fotos stock de parejas sonriendo con laptop, billetes, gráficos 3D, candados dorados.

---

## 5. Checklist rápido

- [ ] ¿El monto es lo más grande en pantalla?
- [ ] ¿Uso máximo 2 colores de acento?
- [ ] ¿El texto secundario está en Slate y no en negro?
- [ ] ¿El radio de la tarjeta es 12px?
- [ ] ¿La acción principal es única y clara?

---

*Versión 1.0 — 2026-04-14*
