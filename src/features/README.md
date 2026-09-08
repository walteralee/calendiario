# features/

Una carpeta por **dominio funcional** de la app. Cada feature es autocontenida.

Dominios: calendar · journal · media · tasks · events · metrics · analytics · search · settings

Estructura recomendada dentro de cada feature:

    <feature>/
    ├── components/        componentes propios de este dominio
    ├── hooks/             hooks de React propios de este dominio
    ├── <feature>.api.ts   llamadas invoke() a los comandos Rust de este dominio
    ├── types.ts           tipos TS de este dominio (espejo de los structs de Rust)
    └── index.ts           qué expone la feature al resto de la app

Espeja la misma división que el backend (src-tauri/src/modules/).
