-- Remove unwanted tables that were imported from remote schema
-- Non-destructive checks (uses IF EXISTS) to safely remove these objects locally

begin;

-- Drop RLS policies (if any)
DROP POLICY IF EXISTS "Anatomy are managed by owner" ON public.anatomy;
DROP POLICY IF EXISTS "App settings are managed by owner" ON public.app_settings;
DROP POLICY IF EXISTS "Classes templates are managed by owner" ON public.classes_templates;
DROP POLICY IF EXISTS "Companies are managed by owner" ON public.companies;
DROP POLICY IF EXISTS "Equipment are managed by owner" ON public.equipment;
DROP POLICY IF EXISTS "Events are managed by owner" ON public.events;
DROP POLICY IF EXISTS "Exercises are managed by owner" ON public.exercises;
DROP POLICY IF EXISTS "Invoices are managed by owner" ON public.invoices;
DROP POLICY IF EXISTS "Profiles are managed by owner" ON public.profiles;
DROP POLICY IF EXISTS "Program exercises are managed by owner" ON public.program_exercises;
DROP POLICY IF EXISTS "Programs are managed by owner" ON public.programs;

-- Drop tables (if they exist). CASCADE used to remove dependent objects created by remote schema.
DROP TABLE IF EXISTS public.anatomy CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;
DROP TABLE IF EXISTS public.classes_templates CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.equipment CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.program_exercises CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;

-- Ensure any stray indexes or sequences are removed (no-op if they don't exist)
DROP INDEX IF EXISTS public.profiles_invite_token_unique;

commit;
