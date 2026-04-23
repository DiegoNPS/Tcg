# Supabase Setup

## 1) Run initial migration

Open Supabase SQL Editor and run:

- `supabase/migrations/202604220001_init.sql`

This creates:

- Enums `tcg_juego`, `categoria_torneo`, `estado_inscripcion`
- Tables `tiendas`, `torneos`, `inscripciones`
- RLS policies and indexes

## 2) Create a first store profile

After logging in for the first time, create a row in `public.tiendas` with your auth user id as `owner_id`.

## 3) Optional: regenerate types

If you have Supabase CLI configured, regenerate and overwrite `src/types/database.types.ts`:

```bash
npx supabase gen types typescript --project-id <PROJECT_ID> --schema public > src/types/database.types.ts
```
