-- Add `trial_ends_at` to clinics and backfill from `stripe_trial_end` if present

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'clinics'
          AND column_name = 'trial_ends_at'
    ) THEN
        ALTER TABLE public.clinics
          ADD COLUMN trial_ends_at timestamp with time zone;
        RAISE NOTICE 'Added column trial_ends_at to public.clinics';

        -- If an older stripe_trial_end column exists, backfill values.
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'clinics'
              AND column_name = 'stripe_trial_end'
        ) THEN
            UPDATE public.clinics
            SET trial_ends_at = stripe_trial_end
            WHERE trial_ends_at IS NULL AND stripe_trial_end IS NOT NULL;
            RAISE NOTICE 'Backfilled trial_ends_at from stripe_trial_end where present';
        END IF;
    END IF;
END $$;

-- Ensure PostgREST (supabase) reloads schema cache
NOTIFY pgrst, 'reload schema';
