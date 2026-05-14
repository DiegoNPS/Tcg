# TCG Hub (TCG Torneos)

Plataforma web para descubrir, publicar e inscribirse en torneos de Trading Card Games en Chile.
Este README es la carta de presentacion del proyecto y tambien una guia tecnica completa
para instalar, configurar y ejecutar la app.

## Tabla de contenidos
- Vision y objetivos
- Flujo del producto
- Capturas, resultados y novedades
- Arquitectura
- Stack tecnologico
- Requisitos
- Instalacion rapida
- Variables de entorno
- Base de datos y migraciones
- Comandos
- Rutas y API
- Seguridad y roles
- Despliegue
- Estructura del proyecto
- Equipo y licencia

## Vision y objetivos

TCG Hub centraliza la difusion de torneos TCG, resolviendo la fragmentacion actual en
canales informales. La plataforma permite que tiendas administren eventos y que jugadores
descubran torneos relevantes para ellos.

Objetivos:
- Centralizar la difusion de eventos TCG en una sola plataforma.
- Facilitar la inscripcion de participantes a torneos.
- Mejorar la visibilidad de tiendas organizadoras.

## Flujo del producto

**Jugadores**
- Exploran torneos publicados en la portada.
- Filtran por juego, categoria o ciudad.
- Revisan detalle y se inscriben.

**Tiendas**
- Inician sesion y acceden a su panel.
- Crean torneos (borrador o publicado).
- Editan torneos existentes y gestionan su visibilidad.

## Capturas, resultados y novedades

- Capturas: agrega imagenes en `docs/screenshots/` y enlazalas aqui.
- Resultados: resume hitos (MVP, pruebas con usuarios, despliegues).
- Novedades: publica cambios relevantes por version.

## Arquitectura

Arquitectura serverless con separacion entre UI y backend gestionado por Supabase.

```
Cliente (Browser)
  |
  v
Next.js (Vercel Edge)
  - Client Components: UI interactiva
  - Server Components: SSR / SSG / API Routes
      |
      v
Supabase
  - PostgreSQL: torneos, tiendas, inscripciones
  - Auth: OAuth / Email
  - Storage: imagenes y banners
```

## Stack tecnologico

- Next.js (App Router)
- Supabase (PostgreSQL, Auth, Storage)
- TypeScript
- Tailwind CSS
- Zod

## Requisitos

- Node.js 18+
- npm
- Cuenta Supabase con RLS habilitado

## Instalacion rapida

1. Clonar el repositorio:

```bash
git clone https://github.com/DiegoNPS/Tcg.git
cd Tcg
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear `.env.local` en la raiz:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<tu-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<tu-anon-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<opcional>

# Solo servidor/CI (no exponer en cliente):
SUPABASE_SERVICE_ROLE=<service-role-key>
```

4. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

## Variables de entorno

| Variable | Requerida | Descripcion |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Si | URL del proyecto Supabase |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Si | Anon key de Supabase |
| NEXT_PUBLIC_APP_URL | Si | URL base de la app (local o prod) |
| NEXT_PUBLIC_GOOGLE_MAPS_API_KEY | No | Maps JS API + Places API habilitadas |
| SUPABASE_SERVICE_ROLE | No | Solo para endpoints admin en servidor |

Notas:
- `SUPABASE_SERVICE_ROLE` nunca debe estar disponible en el cliente.
- Google Maps requiere billing habilitado en Google Cloud.

## Base de datos y migraciones

Las migraciones viven en `supabase/migrations/` y se ejecutan desde el SQL Editor de Supabase.

Orden recomendado:
- `202604220001_init.sql` (tablas base y RLS)
- `202605010001_torneos_coords.sql` (latitud/longitud en torneos)
- `202605010002_torneos_imagen.sql` (imagen_url y bucket de storage)
- `202605080001_tcg_bucket.sql` (bucket adicional si aplica)

Tablas clave:
- `profiles` (roles: `jugador` | `tienda`)
- `tiendas`
- `torneos`
- `tournament_entries`

## Comandos

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Rutas principales

- `/` listado publico de torneos con filtros.
- `/login` inicio de sesion.
- `/signup` registro.
- `/auth/callback` callback OAuth.
- `/tienda/dashboard` panel privado de tienda.
- `/tienda/nuevo-torneo` creacion de torneos.

## API (REST)

**Autenticacion**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/password-reset`
- `POST /api/auth/password-reset/confirm`
- `PUT /api/auth/password-change`
- `PUT /api/auth/me`

**Admin**
- `POST /api/admin/users`
- `POST /api/admin/roles`

**Torneos**
- `GET /api/torneos` (filtros: `juego`, `categoria`, `ciudad`)
- `GET /api/torneos/:id`
- `POST /api/torneos/crear`
- `PUT /api/torneos/:id/editar`

**Tiendas**
- `POST /api/tiendas`

**Inscripciones**
- `POST /api/inscripciones`

## Seguridad y roles

- `profiles.user_role` define si un usuario es `jugador`, `tienda` o `admin`.
- El panel `/admin` usa el client de servicio del servidor para revisar usuarios, tiendas, torneos e inscripciones.
- Cambios de rol deben ejecutarse en el servidor mediante `SUPABASE_SERVICE_ROLE`.
- RLS asegura que cada tienda solo administre sus propios torneos.

## Despliegue

Despliegue recomendado en Vercel:
- Configura las variables de entorno en Preview y Production.
- Verifica las politicas RLS y los buckets en Supabase.
- Si usas endpoints admin, configura `SUPABASE_SERVICE_ROLE` solo en entorno server.

## Estructura del proyecto

```
src/
  app/                # Rutas y API (App Router)
  components/         # UI y formularios
  lib/                # Constantes, auth y Supabase clients
  types/              # Tipos TS del esquema
supabase/
  migrations/         # Migraciones SQL
docs/                 # Documentacion tecnica
```

## Equipo y licencia

Proyecto academico DUOC UC (Ingenieria en Informatica).

Equipo:
- Alvaro Cabezas P. (Lider / Analista Funcional)
- Diego Pena S. (DBA / Frontend)
- Federico Pereira (Backend / Otros)

## Flujo recomendado de verificacion

1. `npm run dev` y abrir `/`.
2. Navegar a `/tienda/dashboard` sin sesion y validar redirect a `/login`.
3. Iniciar sesion por email y confirmar regreso al dashboard.
4. Publicar torneo desde `/tienda/nuevo-torneo` y validar revalidacion en `/`.
5. Ejecutar `npm run lint` y `npm run typecheck`.

## Roles y seguridad (nota importante)

- El proyecto distingue tres roles de usuario en `profiles.user_role`: `jugador`, `tienda` y `admin`.
- El panel de administración vive en `/admin` y usa el client de servicio del servidor para revisar usuarios, tiendas, torneos e inscripciones.
- Para evitar elevaciones de privilegio, los cambios de rol desde el propio usuario están restringidos. El endpoint `PUT /api/auth/me` ya no permite que un usuario cambie su `user_role` arbitrariamente; los cambios deben gestionarse por un administrador o mediante procesos de servicio que usen `SUPABASE_SERVICE_ROLE`.
- `SUPABASE_SERVICE_ROLE` es una credencial sensible que **NUNCA** debe exponerse en clientes. Configúrala solo en variables de entorno de servidor/CI.
- Si necesitas que un usuario pase de `jugador` a `tienda` en tu flujo, implementa un proceso de aprobación (admin) que use el endpoint admin con service role para actualizar `profiles.user_role`.

Roles disponibles en la app:
- `jugador`: se inscribe y consulta sus torneos.
- `tienda`: crea tiendas y publica torneos.
- `admin`: gestiona usuarios, tiendas, torneos e inscripciones desde `/admin`.

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

Licencia: uso academico.
