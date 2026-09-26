# lib/

Utilidades **transversales** (no pertenecen a ningún dominio):

- `api.ts` → puente con el backend de C#: una función por endpoint (`fetch` a `/api/*`).
- `utils.ts` → `cn()`, helper de clases para Tailwind (clsx + tailwind-merge), lo pide shadcn/ui.
- `dates.ts` (previsto) → helpers de fecha sobre date-fns.
