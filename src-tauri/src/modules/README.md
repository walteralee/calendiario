# modules/

El monolito modular. Una carpeta por dominio, misma división que el frontend.

Cada módulo, cuando tenga código, seguirá estas capas:

    <modulo>/
    ├── mod.rs          declara y re-exporta lo del módulo
    ├── model.rs        domain: structs (Day, Media...) + serde
    ├── repository.rs   SQL con SQLx (única capa que toca la BD)
    ├── service.rs      lógica de negocio (llama al repository)
    └── commands.rs     #[tauri::command] (llaman al service, NO a la BD directamente)

Flujo: React --invoke--> commands.rs --> service.rs --> repository.rs --> SQLx --> SQLite

Pendiente de crear en fases posteriores (no ahora):

- src-tauri/src/db.rs pool de SQLx + ejecución de migraciones
- src-tauri/src/error.rs AppError compartido (thiserror)
- migrations/ ficheros .sql de SQLx

Estas carpetas están vacías a propósito: se irán rellenando módulo a módulo.
`lib.rs` todavía NO declara `mod modules;` — se hará al empezar la Fase 3.
