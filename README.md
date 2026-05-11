# TCG Torneos

Base funcional para gestionar torneos de Trading Card Games con Next.js 16 + Supabase SSR.

## Stack

- Next.js 16 (App Router + REST API)
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

## Autenticación (Estándar 2026)

El proyecto soporta dos métodos de autenticación modernos:

**1. Email + Contraseña:**
- Registrarse: `POST /api/auth/register` (email + password)
- Iniciar sesión: `POST /api/auth/login` (email + password)
- UI en `/login` y `/signup`

**2. Google OAuth:**
Para habilitar Google:

1. En Supabase ve a Authentication > Providers > Google y habilita el provider.
2. Crea credenciales OAuth en Google Cloud (OAuth client ID tipo Web application).
3. Agrega estos Authorized redirect URIs en Google Cloud:
	- `https://<TU_PROJECT_REF>.supabase.co/auth/v1/callback`
4. Copia Client ID y Client Secret en Supabase (provider Google).
5. En Supabase > Authentication > URL Configuration define:
	- Site URL: `http://localhost:3000` (local) y luego tu dominio de produccion.
	- Additional Redirect URLs:
	  - `http://localhost:3000/auth/callback`
	  - `https://tu-dominio.com/auth/callback`
6. Verifica que tu app tenga:
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
7. Reinicia `npm run dev` y prueba `/login` con el botón "Continuar con Google".

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
- `/login` iniciar sesión (email/password o Google).
- `/signup` crear cuenta (email/password).
- `/auth/callback` intercambio de codigo por sesion.
- `/tienda/dashboard` panel privado para tienda.
- `/tienda/nuevo-torneo` formulario y publicacion de torneos.

## API HTTP

Endpoints disponibles para consumo externo (REST):
**Autenticación:**
- `POST /api/auth/register`: crea cuenta con email/password.
- `POST /api/auth/login`: inicia sesión con email/password.

**Torneos (públicos):**
- `GET /api/torneos`: lista torneos publicados.
	- Filtros opcionales: `juego`, `categoria`, `ciudad`.
- `GET /api/torneos/:id`: detalle de un torneo publicado.
s:

**Registro:**
```json
{
	"email": "duelista@ejemplo.com",
	"password": "secreto123",
	"nextPath": "/tienda/dashboard"
}
```

**Login:**
```json
{
	"email": "duelista@ejemplo.com",
	"password": "secreto123"
}
```

**Crear tienda:**
```json
{
	"nombre": "TCG Santiago Centro",
	"ciudad": "Santiago"
}
```

**Inscribirse:**```json
{
	"nombre": "TCG Santiago Centro",
	"ciudad": "Santiago"
}
```

```json
{
	"torneo_id": "00000000-0000-0000-0000-000000000000"
}
```

## Flujo recomendado de verificacion

1. `npm run dev` y abrir `/`.
2. Navegar a `/tienda/dashboard` sin sesion y validar redirect a `/login`.
3. Iniciar sesion por email y confirmar regreso al dashboard.
4. Publicar torneo desde `/tienda/nuevo-torneo` y validar revalidacion en `/`.
5. Ejecutar `npm run lint` y `npm run typecheck`.
