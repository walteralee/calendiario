# Calendiario

App de escritorio tipo **línea temporal visual de una vida**: diario, fotos,
tareas, eventos y métricas por día, más analytics personal. Offline-first, 100% local.
El concepto central se llama **Day / DayRecord**, nunca `Event`.

Se desarrolla **paso a paso, fichero a fichero, con fin formativo**. No generar
funcionalidad entera de golpe; explicar decisiones; el ritmo lo marca el usuario (Walter).
Responder en español.

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + Zustand + date-fns + Recharts.
- **Backend (activo)**: C# / .NET 9 en `src-dotnet/`, un solo proceso:
  - **Kestrel** (ASP.NET Core, Minimal API) en `127.0.0.1` con puerto aleatorio: sirve
    el frontend compilado (`dist/` → `wwwroot/`, con fallback de SPA) y la API `/api/*`.
    Todo es mismo origen.
  - **Photino.NET** solo abre la ventana nativa (WebView2) apuntando a esa URL.
- **Datos**: SQLite (`calendiario.db`). Consultas con **Dapper** (SQL explícito); esquema
  con **EF Core Migrations** (solo migraciones, EF no se usa para consultar).
  Multimedia en filesystem local (rutas en SQLite, nunca BLOBs).
- **Backend anterior (Rust/Tauri 2)**: vive solo en la rama `main`, como referencia para
  comparar comportamiento (allí `run.bat` lo lanza). En esta rama `src-tauri/` no existe.
  No se desarrolla más.

## Reglas de arquitectura (no negociables)

1. **React nunca toca la BD.** Flujo único:
   `React → src/lib/api.ts (fetch) → Endpoints → Service → Repository (Dapper) → SQLite`.
2. **Monolito modular por capas.** Código por dominio en `src/features/<x>/` (front) y
   `src-dotnet/Modules/<X>/` (back), con los mismos nombres de dominio en ambos lados.
3. Cada módulo C#: `<Entidad>.cs` (Model, `record`), `<X>Repository.cs` (SQL con Dapper),
   `<X>Service.cs` (lógica), `<X>Endpoints.cs` (Minimal API, solo llaman al service).
   Registrar el service/repository en `Program.cs` y mapear los endpoints bajo el grupo `/api`.
4. **Errores**: el service lanza `AppException("mensaje para el usuario")` → 400
   `{ "error": "…" }`. Cualquier otra excepción → 500 `{ "error": "Error interno." }` y el
   detalle SOLO al log (`ApiErrors.cs`). Nunca devolver mensajes internos al usuario.
5. **JSON en camelCase** (por defecto en Minimal API, verificado). Columnas SQL en
   snake_case → propiedades PascalCase vía `Dapper.DefaultTypeMap.MatchNamesWithUnderscores`.
6. **Migraciones versionadas**: nunca editar una migración ya aplicada/publicada; cambios
   de esquema = migración nueva (`dotnet ef migrations add`).
7. **Un DayRecord existe en BD solo si el usuario mete algo ese día.** No se crean 365 filas/año.
8. Guardar siempre **datos estructurados + texto humano** (métricas numéricas junto al diario).
9. Multimedia: `media/AAAA/MM/DD/…` + `thumbnails/…`. SQLite solo guarda `path`/`thumbnail_path`.
10. **Seguridad del servidor local**: Kestrel solo en loopback, `AllowedHosts` restringido
    (anti DNS rebinding), CSP en todas las respuestas HTML (`Program.cs`). No abrir CORS.
11. **Sin versión web/móvil en v1.** El servidor HTTP es local e interno a la app de escritorio.

## Estructura

```
calendiario - app/
├── src/                      FRONTEND
│   ├── main.tsx  App.tsx  index.css
│   ├── components/  (+ ui/ = shadcn)
│   ├── features/   auth calendar journal media tasks events metrics analytics search settings
│   ├── pages/      Welcome AppHome (+ YearView MonthView WeekView DayView Analytics)
│   ├── lib/        utils.ts (cn), api.ts (una función por endpoint)
│   ├── hooks/  stores/ (Zustand)  types/
│   └── assets/
├── src-dotnet/               BACKEND (C#)
│   ├── Program.cs            Kestrel + CSP + estáticos/fallback SPA + Photino + log a fichero
│   ├── ApiErrors.cs  AppException.cs
│   ├── Assets/app-icon.ico   icono (de ../app-icon.svg): .exe (ApplicationIcon) + ventana (SetIconFile)
│   ├── Data/                 Database.cs (carpeta de datos, migrar, conexiones)
│   │                         CalendiarioDbContext.cs (solo esquema) · Migrations/
│   └── Modules/Auth/         Profile · ProfileRepository · ProfileService · ProfileEndpoints
└── .config/dotnet-tools.json dotnet-ef (herramienta local)
```

Alias TS/Vite: `@/*` → `src/*`.

## Datos y logs

- Carpeta de datos: `%APPDATA%\com.calendiario.dotnet` (Release) o
  `%APPDATA%\com.calendiario.dotnet.dev` (Debug). Nunca tocar `com.calendiario.desktop`
  (es de la app en Rust).
- Log: `<carpeta de datos>\logs\calendiario-AAAAMMDD.log` (Serilog, 14 días), igual en
  Debug y Release. En Debug también sale por consola.

## Comandos

```
npm run build                          # frontend → dist/ (hacer ANTES de compilar el C#)
dotnet run --project src-dotnet        # app en Debug (consola + DevTools)
dotnet build src-dotnet -c Release     # build Release (WinExe, sin consola ni DevTools)
dotnet tool restore                    # instala dotnet-ef tras clonar
dotnet ef migrations add <Nombre> --project src-dotnet --output-dir Data/Migrations
npx shadcn@latest add <componente>     # añadir componente de UI
```

`run.bat` (doble clic) = `npm run build` + `dotnet build src-dotnet` + abre el `.exe` de
Debug; si falla un paso, se para. En la rama `main`, `run.bat` sigue lanzando la versión Tauri.

`npm run dev` (Vite en :1420) sirve la UI sola, pero sin backend: las llamadas a `/api`
fallan con "Respuesta inesperada del servidor…" (no hay proxy configurado todavía).

Frontend: `api.ts` siempre lanza un string al fallar (no 2xx, sin conexión, 2xx no-JSON), y
todo `catch` de un componente debe dejar rastro con `console.error` — nunca tragarse el error.

## Estado y roadmap

Ver `../informacion/ESTADO.md` (actualizar al cerrar cada sesión) y
`../informacion/ARQUITECTURA.txt`.

## Convenciones

- Componentes React: PascalCase. Hooks: `useXxx`.
- C#: PascalCase para tipos/métodos, métodos async con sufijo `Async`; rutas REST en
  kebab-case (`/api/profile/has-pin`).
- No introducir dependencias nuevas sin acordarlo con el usuario.
- No adelantar fases del roadmap sin acordarlo.
