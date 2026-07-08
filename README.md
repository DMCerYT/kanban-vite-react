# Kanban Personal

Aplicativo Kanban en Vite + React para organizar proyectos personales, etapas, pasos, fechas y notas del proyecto.

## Desarrollo

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configura `.env.local` con los valores del proyecto Supabase:

```bash
VITE_SUPABASE_URL=https://ftqworwgmvpkohohautr.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_or_anon_key_here
```

Usa una key publica/publishable o anon. Nunca pongas la `service_role` key en Vite porque el frontend se envia al navegador.

## Base de datos

Ejecuta el SQL de:

```bash
supabase/migrations/20260708021500_create_kanban_schema.sql
```

La migracion crea:

- `projects`
- `kanban_columns`
- `tasks`

Todas las tablas tienen RLS activado y politicas para que cada usuario autenticado solo pueda operar sus propios proyectos.

## Auth

La app usa Supabase Auth con email/password. En Supabase Dashboard, revisa:

- Authentication > Providers > Email
- Si quieres cuentas sin confirmacion de email para pruebas locales, ajusta esa opcion desde el Dashboard.

## Publicacion en Vercel

1. Sube esta carpeta a un repositorio de GitHub.
2. En Vercel, crea un nuevo proyecto desde el repositorio.
3. Usa estos valores:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Agrega estas Environment Variables en Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
