# Store Tournament Management

Frontend implementation for store-side tournament creation and editing.

## New Routes

| Route | Description |
|---|---|
| `/tienda/nuevo-torneo` | Create tournament form |
| `/tienda/torneos/[id]/editar` | Edit existing tournament |
| `/tienda/dashboard` | Lists all store tournaments with Edit button |

## New Components

### `TorneoForm` (`src/components/forms/torneo-form.tsx`)
Shared form for create and edit modes. Uses React hooks and fetch-based API consumption for modern client-side form handling.

- `mode="create"` (default) — POST to `/api/torneos/crear`
- `mode="edit"` — PUT to `/api/torneos/[id]/editar` with tournament ID from defaults
- Supports publishing (publicado=true) or saving as draft (publicado=false)

### `DireccionAutocomplete` (`src/components/ui/direccion-autocomplete.tsx`)
Google Maps Places Autocomplete input for the address field.
- Restricted to Chile (`cl`)
- Auto-extracts commune from address components → passed via `onAddressChange` callback
- Captures `lat/lng` → passed via `onAddressChange` callback
- Renders a map preview with a pin after address selection
- Falls back to plain text input if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is not set

### `ImagenUpload` (`src/components/ui/imagen-upload.tsx`)
Image upload with preview backed by Supabase Storage.
- Uploads to `torneos/{user_id}/{uuid}.ext`
- Max 5MB, images only
- Shows upload progress overlay
- Calls `onUpload` callback with public URL after successful upload

## REST API Endpoints

### `POST /api/torneos/crear`
Create a new tournament for authenticated user's store.
- Requires authenticated session
- Validates user owns a tienda
- Request body: `{ titulo, descripcion, tcg_juego, categoria, ciudad, direccion, fecha_inicio, cupo_maximo, costo_entrada, publicado, latitud, longitud, imagen_url }`
- Returns: 201 with tournament data, 401 if not authenticated, 403 if user has no tienda, 400 on validation error

### `PUT /api/torneos/[id]/editar`
Update existing tournament.
- Requires authenticated session and ownership verification
- Request body: Same as POST /api/torneos/crear
- Returns: 200 on success, 401 if not authenticated, 403 if not owner, 404 if tournament not found, 400 on validation error

## Server Actions (Deprecated)

> Note: The following Server Actions are no longer in use and kept for reference only. All operations now use REST API endpoints with fetch-based consumption.

### `crearTorneo` (`src/actions/crearTorneo.ts`) — DEPRECATED
Replaced by `POST /api/torneos/crear`

### `editarTorneo` (`src/actions/editarTorneo.ts`) — DEPRECATED
Replaced by `PUT /api/torneos/[id]/editar`

## Database Migrations

Run in order via Supabase SQL Editor:

### `202605010001_torneos_coords.sql`
Adds `latitud` and `longitud` (double precision, nullable) to `torneos`.

### `202605010002_torneos_imagen.sql`
- Adds `imagen_url` (text, nullable) to `torneos`
- Creates public Supabase Storage bucket `torneos`
- RLS policies: users can only upload/update/delete files inside their own `{user_id}/` folder; public read access for all

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon key |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Google Maps API key |

Google Maps requires **Maps JavaScript API** and **Places API** enabled in Google Cloud Console, with billing active.

## What Backend Needs to Provide

See [backend-requirements.md](./backend-requirements.md) for the full list of backend changes required to support this feature.
