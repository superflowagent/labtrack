-- Ensure remote DB has `trial_ends_at` column on clinics (idempotent)
-- This migration is intentionally defensive: it uses IF NOT EXISTS so it can be re-run safely.

ALTER TABLE IF EXISTS public.clinics
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone;

-- Backfill from stripe_trial_end if the column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'stripe_trial_end'
  ) THEN
    UPDATE public.clinics
    SET trial_ends_at = stripe_trial_end
    WHERE trial_ends_at IS NULL AND stripe_trial_end IS NOT NULL;
  END IF;
END $$;

-- Force PostgREST (supabase) to reload the schema cache
NOTIFY pgrst, 'reload schema';
