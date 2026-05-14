# TCG Torneos

Proyecto Next.js + Supabase para gestionar torneos TCG (tiendas, torneos, inscripciones).

Este README reúne todo lo necesario para descargar, configurar y ejecutar el proyecto, además de describir los flujos de autenticación y los endpoints relevantes.

## Contenido
- Requisitos
- Instalación
- Variables de entorno necesarias
- Comandos útiles
- Flujo de auth y endpoints
- Base de datos & migraciones
- Buenas prácticas

## Requisitos
- Node.js (>=18)
- npm
- Cuenta Supabase (proyecto con RLS habilitado)

## Instalación

1. Clona el repo:

```bash
git clone https://github.com/DiegoNPS/Tcg.git
cd Tcg
```

2. Instala dependencias:

```bash
npm install
```

3. Variables de entorno: crea un `.env.local` en la raíz con al menos:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon-public-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<optional>

# Opcional (solo en servidores admin):
SUPABASE_SERVICE_ROLE=<service-role-key>
```

Nota: `SUPABASE_SERVICE_ROLE` debe permanecer en entornos seguros (server, CI encrypted vars).

## Comandos

```bash
# Desarrollo
npm run dev

# Lint
npm run lint

# Type check
npm run typecheck

# Build
npm run build
```

## Flujo de autenticación (resumen)

- Registro público: `POST /api/auth/register` (ya implementado). Crea usuario en Supabase y `profiles`.
- Login: mediante SDK/OAuth (callbacks ya implementadas). Cookies httpOnly para SSR.
- Recuperar contraseña:
  - Iniciar: `POST /api/auth/password-reset` (envía email de recuperación)
  - Confirmar (admin-backed): `POST /api/auth/password-reset/confirm` (requiere `SUPABASE_SERVICE_ROLE`) — este endpoint permite establecer nueva contraseña para `user_id`.
  - Cambio por usuario autenticado: `PUT /api/auth/password-change` (requiere sesión).
- Perfil: `PUT /api/auth/me` (upsert en `profiles`).
- Admin crear usuario: `POST /api/admin/users` (requiere service role en servidor).

Rutas y firmas están en `src/app/api/...`.

## Endpoints principales

- `POST /api/auth/register` — crear cuenta
- `POST /api/auth/password-reset` — iniciar recuperación (email)
- `POST /api/auth/password-reset/confirm` — confirmar nueva contraseña (admin)
- `PUT /api/auth/password-change` — cambiar contraseña (autenticado)
- `PUT /api/auth/me` — actualizar perfil
- `POST /api/admin/users` — crear usuario (admin/service role)

## Base de datos y migraciones

El proyecto usa Supabase (Postgres + RLS). Las migraciones están en `supabase/migrations/`.
Tablas clave:
- `profiles` — perfil del usuario con `user_role` (`jugador` | `tienda`)
- `tiendas` — tiendas (owner_id -> auth.users)
- `torneos` — torneos publicados/privados
- `tournament_entries` — inscripciones (nuevo modelo que sustituyó a `inscripciones`)

Ver `supabase/migrations/` para los scripts y políticas RLS.

## Testing y QA

- Recomendado: crear pruebas de integración para flujos críticos (registro, login, reset, crear torneo, inscribir).
- Sugerencia de herramientas: Jest + Supertest para endpoints, Playwright para E2E.

## Despliegue

- Asegurar variables de entorno en el host (Vercel/Netlify/Render) incluyendo `SUPABASE_SERVICE_ROLE` si se usa endpoint admin.
- Revisar políticas RLS en el proyecto Supabase para que coincidan con lo definido en `supabase/migrations`.

## Documentación y capturas

Se recomienda agregar capturas de pantalla de la app y diagramas de flujo en esta sección antes del lanzamiento.

## Recursos & ejemplos de README

- Plantillas: https://github.com/topics/awesome-readme-template
- Ejemplo de README detallado: https://github.com/supuna97/supuna97

---
Si querés, agrego un checklist de pruebas automáticas y ejemplos de requests curl para cada endpoint.
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

## Roles y seguridad (nota importante)

- El proyecto distingue dos roles de usuario en `profiles.user_role`: `jugador` y `tienda`.
- Para evitar elevaciones de privilegio, los cambios de rol desde el propio usuario están restringidos. El endpoint `PUT /api/auth/me` ya no permite que un usuario cambie su `user_role` arbitrariamente; los cambios deben gestionarse por un administrador o mediante procesos de servicio que usen `SUPABASE_SERVICE_ROLE`.
- `SUPABASE_SERVICE_ROLE` es una credencial sensible que **NUNCA** debe exponerse en clientes. Configúrala solo en variables de entorno de servidor/CI.
- Si necesitas que un usuario pase de `jugador` a `tienda` en tu flujo, implementa un proceso de aprobación (admin) que use el endpoint admin con service role para actualizar `profiles.user_role`.

Si querés, puedo añadir un endpoint admin para asignar roles y una guía paso a paso para el proceso de aprobación.

### Endpoint admin para asignar roles

Hay un endpoint admin para asignar `user_role` desde server usando la `SUPABASE_SERVICE_ROLE`:

- `POST /api/admin/roles` — body: `{ "user_id": "<uuid>", "role": "jugador" | "tienda" }`

Ejemplo `curl` usando la `SERVICE_ROLE` en el servidor:

```bash
curl -X POST https://tu-app.com/api/admin/roles \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer $SUPABASE_SERVICE_ROLE" \
	-d '{"user_id":"00000000-0000-0000-0000-000000000000","role":"tienda"}'
```

Nota: llama este endpoint solo desde entornos de servidor; protege su acceso con controles adicionales si fuera necesario (IP allowlist, admin auth, etc.).
