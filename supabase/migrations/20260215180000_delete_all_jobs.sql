-- 20260215_delete_all_jobs.sql
-- Elimina todos los trabajos antiguos antes de modificar el esquema
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs') THEN
    DELETE FROM public.jobs;
  END IF;
END
$$;;