# Calendiario

App de escritorio (Tauri 2) tipo **línea temporal visual de una vida**: diario, fotos,
tareas, eventos y métricas por día, más analytics personal. Offline-first, 100% local.
El concepto central se llama **Day / DayRecord**, nunca `Event`.

Se desarrolla **paso a paso, fichero a fichero, con fin formativo**. No generar
funcionalidad entera de golpe; explicar decisiones; el ritmo lo marca el usuario (Walter).
Responder en español.

## Stack (v1, cerrado)

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + Zustand + date-fns + Recharts.
- **Desktop**: Tauri 2.
- **Backend**: Rust + Tauri Commands (`#[tauri::command]`). Sin servidor HTTP.
- **Datos**: SQLite vía **SQLx** (archivo único `calendiario.db`). Multimedia en filesystem local (rutas en SQLite, nunca BLOBs).
- **Analytics**: SQL + Rust/TS + Recharts.

## Reglas de arquitectura (no negociables)

1. **React nunca toca la BD.** Flujo único:
   `React → invoke("cmd", args) → commands.rs → service.rs → repository.rs → SQLx → SQLite`.
2. **Monolito modular por capas.** Código por dominio en `src/features/<x>/` (front) y
   `src-tauri/src/modules/<x>/` (back), con los mismos nombres de dominio en ambos lados.
3. Cada módulo Rust: `mod.rs`, `model.rs` (domain), `repository.rs` (SQL), `service.rs`
   (lógica), `commands.rs` (`#[tauri::command]`, solo llaman al service).
4. **Un DayRecord existe en BD solo si el usuario mete algo ese día.** No se crean 365 filas/año.
5. Guardar siempre **datos estructurados + texto humano** (métricas numéricas junto al diario).
6. Multimedia: `media/AAAA/MM/DD/…` + `thumbnails/…`. SQLite solo guarda `path`/`thumbnail_path`.
7. Permisos: cada comando/plugin nuevo debe declararse en `src-tauri/capabilities/`.
8. **Sin versión web/móvil en v1.** No añadir Axum, PostgreSQL, PWA, Android.

## Estructura

```
calendiario - app/
├── src/                      FRONTEND
│   ├── main.tsx  App.tsx  index.css
│   ├── components/  (+ ui/ = shadcn)
│   ├── features/   calendar journal media tasks events metrics analytics search settings
│   ├── pages/      YearView MonthView WeekView DayView Analytics
│   ├── lib/        utils.ts (cn), invoke tipado, helpers de fecha
│   ├── hooks/  stores/ (Zustand)  types/ (espejo de structs Rust)
│   └── assets/
└── src-tauri/                BACKEND
    ├── src/main.rs  src/lib.rs  (setup + registro de comandos + run())
    ├── src/modules/  <mismos dominios que features/>   (aún NO wired en lib.rs)
    ├── tauri.conf.json  capabilities/  icons/  Cargo.toml
    └── (pendiente) db.rs  error.rs   ·   migrations/ en la raíz del proyecto
```

Alias TS/Vite: `@/*` → `src/*`.

## Comandos

```
npm run tauri dev      # dev: Vite :1420 + ventana nativa (recarga en vivo)
npm run tauri build    # instalador .msi/.exe (release)
npm run build          # solo frontend: tsc + vite build
npx shadcn@latest add <componente>   # añadir componente de UI
```

`run.bat` en la raíz = doble clic para `tauri dev`.

## Estado y roadmap

Ver `../informacion/ESTADO.md` (actualizar al cerrar cada sesión) y
`../informacion/ARQUITECTURA.txt`. Fase actual: 1 (Fundación).

## Convenciones

- Componentes React: PascalCase. Hooks: `useXxx`. Ficheros de dominio: `kebab`/`snake` coherente con el módulo.
- Rust: `snake_case`, comandos con verbo (`get_day`, `create_task`).
- No introducir dependencias nuevas sin acordarlo con el usuario.
- No adelantar fases del roadmap sin acordarlo.
