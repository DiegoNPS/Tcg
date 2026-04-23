# TCG Torneos

Base funcional para gestionar torneos de Trading Card Games con Next.js 16 + Supabase SSR.

## Stack

- Next.js 16 (App Router + Server Actions)
- Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- Tailwind CSS 4
- TypeScript estricto
- Zod para validacion de mutaciones

## Variables de entorno

Duplica `.env.example` como `.env.local` y completa:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

En Vercel configura las mismas 2 variables para Preview y Production.

## Base de datos

Ejecuta en Supabase SQL Editor:

- `supabase/migrations/202604220001_init.sql`

Eso crea tablas `tiendas`, `torneos`, `inscripciones`, enums y politicas RLS.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Rutas principales

- `/` listado publico de torneos con filtros por query params.
- `/login` acceso por magic link.
- `/auth/callback` intercambio de codigo por sesion.
- `/tienda/dashboard` panel privado para tienda.
- `/tienda/nuevo-torneo` formulario y publicacion de torneos.

## Flujo recomendado de verificacion

1. `npm run dev` y abrir `/`.
2. Navegar a `/tienda/dashboard` sin sesion y validar redirect a `/login`.
3. Iniciar sesion por email y confirmar regreso al dashboard.
4. Publicar torneo desde `/tienda/nuevo-torneo` y validar revalidacion en `/`.
5. Ejecutar `npm run lint` y `npm run typecheck`.
