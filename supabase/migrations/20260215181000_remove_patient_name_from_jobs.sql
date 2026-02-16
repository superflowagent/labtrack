-- 20260215_remove_patient_name_from_jobs.sql
-- Elimina el campo patient_name y patient_phone de la tabla jobs
ALTER TABLE IF EXISTS public.jobs DROP COLUMN IF EXISTS patient_name;
ALTER TABLE IF EXISTS public.jobs DROP COLUMN IF EXISTS patient_phone;