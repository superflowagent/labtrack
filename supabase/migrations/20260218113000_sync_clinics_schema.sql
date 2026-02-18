-- Synchronize `clinics` schema with application expectations
-- - Ensure columns used by the app exist: is_premium, trial_ends_at, stripe_customer_id
-- - Backfill `is_premium` from legacy columns where possible
-- - Drop deprecated subscription-related columns that the app no longer uses
-- This migration is idempotent and safe to run multiple times.

DO $$
BEGIN
  -- Add columns that should exist according to application types
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN is_premium boolean DEFAULT false NOT NULL;
    RAISE NOTICE 'Added column is_premium to clinics';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN trial_ends_at timestamp with time zone;
    RAISE NOTICE 'Added column trial_ends_at to clinics';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN stripe_customer_id text;
    RAISE NOTICE 'Added column stripe_customer_id to clinics';
  END IF;

  -- Backfill is_premium from legacy indicators when present
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'manual_premium'
  ) OR EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'subscription_status'
  ) OR EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'stripe_trial_end'
  ) THEN
    UPDATE public.clinics
    SET is_premium = true
    WHERE is_premium = false AND (
      COALESCE(manual_premium, false) = true
      OR subscription_status IN ('active','trialing')
      OR (stripe_trial_end IS NOT NULL AND stripe_trial_end > now())
      OR (trial_ends_at IS NOT NULL AND trial_ends_at > now())
    );
    RAISE NOTICE 'Backfilled is_premium from legacy subscription indicators where applicable';
  END IF;

  -- Remove deprecated columns that should no longer exist
  ALTER TABLE IF EXISTS public.clinics
    DROP COLUMN IF EXISTS subscription_status,
    DROP COLUMN IF EXISTS stripe_subscription_id,
    DROP COLUMN IF EXISTS stripe_trial_end,
    DROP COLUMN IF EXISTS manual_premium;
  RAISE NOTICE 'Dropped deprecated subscription-related columns from clinics (if present)';
END $$;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
