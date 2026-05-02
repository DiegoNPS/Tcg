# Backend Requirements

Items the backend team needs to implement or confirm for the store tournament management feature.

---

## 1. Database Migrations (Required — run in order)

These are already written in `supabase/migrations/`. Run them via Supabase SQL Editor:

| File | What it does |
|---|---|
| `202605010001_torneos_coords.sql` | Adds `latitud`, `longitud` columns to `torneos` |
| `202605010002_torneos_imagen.sql` | Adds `imagen_url` to `torneos`, creates storage bucket with RLS |

---

## 2. Store Account Provisioning (Pending Decision)

Currently store accounts are created **manually** by inserting directly into the `tiendas` table:

```sql
INSERT INTO public.tiendas (owner_id, nombre, ciudad)
VALUES ('USER_UUID', 'Nombre Tienda', 'Santiago');
```

**Question for backend team:** Is this the agreed approach long-term, or do we need a self-registration flow for stores? If registration is needed, we need:
- A `POST /api/tiendas` endpoint or server action
- An onboarding page for new store owners

---

## 3. RLS Policies Already in Place

The following are already handled — no action needed:

- `torneos` SELECT: public can read published tournaments; store owner can read all their own
- `torneos` INSERT: only the store owner can create tournaments for their tienda
- `torneos` UPDATE/DELETE: only the store owner can modify their tournaments
- Storage bucket `torneos`: users can only manage files in their own `{user_id}/` folder

---

## 4. Admin Global Control (Future)

Not implemented yet. When needed, the agreed approach is a `profiles` table with a `user_role` enum (`player`, `store`, `admin`). This will require:

- New migration for `profiles` table and `user_role` enum
- Auto-create profile trigger on `auth.users` insert
- Updated RLS policies to allow admin bypass on `torneos`, `tiendas`, `inscripciones`
- Admin dashboard routes (separate feature)

---

## 5. Google Maps API Key

The frontend requires `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in all environments (development, preview, production).

- Must have **Maps JavaScript API** and **Places API** enabled
- Must have billing active on the Google Cloud project
- For production: restrict the key to the production domain in Google Cloud Console

---

## 6. Supabase Storage — Size Limit

Currently the 5MB image size limit is enforced **only on the frontend**. To enforce it at the storage level:

Go to **Supabase Dashboard → Storage → torneos → Configuration** and set the max file size to 5MB.
