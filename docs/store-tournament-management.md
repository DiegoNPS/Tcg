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
Shared form for create and edit modes. Uses `useActionState` for inline validation errors without losing form data on failure.

- `mode="create"` (default) — calls `crearTorneo` action
- `mode="edit"` — requires `action` (bound `editarTorneo`) and `defaults` (existing tournament data)

### `DireccionAutocomplete` (`src/components/ui/direccion-autocomplete.tsx`)
Google Maps Places Autocomplete input for the address field.
- Restricted to Chile (`cl`)
- Auto-extracts commune from address components → stored in hidden `ciudad` field
- Captures `lat/lng` → stored in hidden `latitud`/`longitud` fields
- Renders a map preview with a pin after address selection
- Falls back to plain text input if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is not set

### `ImagenUpload` (`src/components/ui/imagen-upload.tsx`)
Image upload with preview backed by Supabase Storage.
- Uploads to `torneos/{user_id}/{uuid}.ext`
- Max 5MB, images only
- Shows upload progress overlay
- Stores public URL in hidden `imagen_url` field

## Server Actions

### `crearTorneo` (`src/actions/crearTorneo.ts`)
- Validates session and store ownership
- Returns `CrearTorneoState` with `fieldErrors` on validation failure (no redirect)
- Redirects to `/tienda/dashboard?created=1` on success

### `editarTorneo` (`src/actions/editarTorneo.ts`)
- Validates session and verifies the authenticated user owns the tournament's tienda
- Returns `EditarTorneoState` with `fieldErrors` on validation failure
- Redirects to `/tienda/dashboard?updated=1` on success

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
