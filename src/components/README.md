# components/

Componentes de UI **reutilizables y "tontos"** (sin lógica de negocio): botones,
tarjetas, layout, modales genéricos...

- `ui/` → aquí se instalan los componentes de **shadcn/ui** (Button, Dialog, etc.).

Si un componente pertenece a un dominio concreto (p. ej. una celda de calendario),
va en `features/<dominio>/components/`, no aquí.
