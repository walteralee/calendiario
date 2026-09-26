# Calendiario

Aplicación de escritorio para registrar y visualizar tu vida día a día: diario, fotos, vídeos, tareas, eventos y métricas personales, más una capa de analítica encima de todos esos datos.

Su concepto central es el **día vivido** (`DayRecord`), no la cita futura: no es un planificador, es una línea temporal de lo que ha pasado. Funciona **100% en local** (sin cuenta, sin servidor, sin nube) sobre una base de datos SQLite y archivos en tu propio disco.

---

# 🚀 Instalación

```bash
git clone https://github.com/walteralee/calendiario.git
cd calendiario
```

## 1. Requisitos

- Node.js 22 o superior
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- Windows con WebView2 Runtime (incluido de serie en Windows 11)

## 2. Instalar dependencias

```bash
npm install
```

Los paquetes NuGet del backend se descargan solos en la primera compilación.

## 3. Ejecutar en desarrollo

Doble clic en `run.bat`, o a mano:

```bash
npm run build
dotnet build src-dotnet
src-dotnet\bin\Debug\net9.0\Calendiario.exe
```

## 4. Compilar en Release

```bash
npm run build
dotnet build src-dotnet -c Release
```

Genera `Calendiario.exe` en `src-dotnet/bin/Release/net9.0/`. El instalador aún no está hecho.

---

# Características

El proyecto está en desarrollo. Estas son las capacidades del producto; el avance real está en «Estado del proyecto».

- Modelo centrado en el día vivido: un registro existe en la base de datos solo si ese día tiene contenido (no se crean 365 días vacíos al año).
- Vistas de calendario: Año, Mes (con collage automático de fotos), Semana y Día.
- Diario de texto libre por día.
- Importación de fotos y vídeos a almacenamiento local, con generación de miniaturas.
- Tareas y eventos asociados a cada fecha.
- Métricas diarias (sueño, ánimo, productividad, gimnasio, trabajo…) guardadas como datos estructurados junto al texto.
- Analítica personal: resúmenes mensuales, series temporales y correlaciones entre hábitos.
- Búsqueda y filtros sobre todo el histórico.
- Exportación y copias de seguridad.
- Sin conexión: los datos nunca salen del ordenador.

---

# Arquitectura

Monolito modular por capas. El frontend nunca accede a la base de datos: toda lectura y escritura pasa por el backend de C#/.NET. Un único proceso sirve la interfaz y una API interna solo en `127.0.0.1`, y Photino.NET la muestra en una ventana nativa.

```
calendiario
│
├── src                     Frontend (React + TypeScript)
│   ├── components           UI reutilizable (+ ui/ = shadcn/ui)
│   ├── features             calendar · journal · media · tasks · events ·
│   │                        metrics · analytics · search · settings
│   ├── pages                YearView · MonthView · WeekView · DayView · Analytics
│   ├── lib · hooks · stores · types
│   └── main.tsx · App.tsx · index.css
│
├── src-dotnet              Backend (C# / .NET)
│   ├── Program.cs           arranque: servidor local + ventana + seguridad
│   ├── Modules              mismos dominios que features/, en capas:
│   │                        Model · Repository · Service · Endpoints
│   ├── Data                 conexión a SQLite + migraciones del esquema
│   └── Calendiario.csproj   configuración del proyecto
│
├── README.md
├── CLAUDE.md                reglas de arquitectura del proyecto
├── package.json
└── run.bat
```

---

# Flujo de funcionamiento

```
El usuario abre un día en el calendario
↓
El frontend llama a la API interna:  getDay(date)  →  GET /api/days/{date}
↓
ASP.NET Core enruta la petición al endpoint correspondiente
↓
Endpoints  →  Service (lógica)  →  Repository (SQL)
↓
Dapper consulta calendiario.db y obtiene los datos del día
y las rutas de su multimedia
↓
Las fotos y vídeos se leen del sistema de archivos local
↓
El día completo vuelve al frontend y se renderiza
```

---

# Tecnologías

- C# · .NET 9
- ASP.NET Core (Minimal API)
- Photino.NET
- React 19 · TypeScript
- Vite
- Tailwind CSS v4 · shadcn/ui
- Zustand
- date-fns
- Recharts
- SQLite · Dapper · EF Core (migraciones)

---

# Estado del proyecto

En desarrollo activo. La **Fase 1 (Fundación)** está completa: toolchain, arquitectura, estructura de carpetas, sistema de estilos y herramientas de calidad (ESLint, Prettier).

El resto del roadmap —vistas de calendario, base de datos, multimedia, métricas y analítica— está en construcción.

Versión actual

```
0.1.0
```

---

# Licencia

Código público para consulta y evaluación (portfolio). **No es open source**: no se permite su uso, copia, modificación ni distribución sin permiso escrito del autor. Ver [`LICENSE`](LICENSE).
