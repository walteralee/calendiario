# features/

Una carpeta por **dominio funcional** de la app. Cada feature es autocontenida.

Dominios: auth · calendar · journal · media · tasks · events · metrics · analytics · search · settings

Estructura recomendada dentro de cada feature:

    <feature>/
    ├── components/        componentes propios de este dominio
    ├── hooks/             hooks de React propios de este dominio
    ├── types.ts           tipos TS de este dominio (espejo de los records de C#)
    └── index.ts           qué expone la feature al resto de la app

Las llamadas al backend no van aquí: todas pasan por `src/lib/api.ts`.

Espeja la misma división que el backend (src-dotnet/Modules/).
