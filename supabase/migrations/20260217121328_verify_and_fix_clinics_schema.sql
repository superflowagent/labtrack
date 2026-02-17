-- Verify and fix clinics table schema
-- Add any missing columns that should exist based on baseline

DO $$
BEGIN
    -- Add stripe_customer_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clinics' 
        AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE "public"."clinics" ADD COLUMN "stripe_customer_id" text;
        RAISE NOTICE 'Added column stripe_customer_id';
    END IF;

    -- Add stripe_subscription_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clinics' 
        AND column_name = 'stripe_subscription_id'
    ) THEN
        ALTER TABLE "public"."clinics" ADD COLUMN "stripe_subscription_id" text;
        RAISE NOTICE 'Added column stripe_subscription_id';
    END IF;

    -- Add subscription_status if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clinics' 
        AND column_name = 'subscription_status'
    ) THEN
        ALTER TABLE "public"."clinics" ADD COLUMN "subscription_status" text;
        RAISE NOTICE 'Added column subscription_status';
    END IF;

    -- Add stripe_trial_end if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clinics' 
        AND column_name = 'stripe_trial_end'
    ) THEN
        ALTER TABLE "public"."clinics" ADD COLUMN "stripe_trial_end" timestamp with time zone;
        RAISE NOTICE 'Added column stripe_trial_end';
    END IF;

    -- Add manual_premium if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clinics' 
        AND column_name = 'manual_premium'
    ) THEN
        ALTER TABLE "public"."clinics" ADD COLUMN "manual_premium" boolean DEFAULT false NOT NULL;
        RAISE NOTICE 'Added column manual_premium';
    END IF;
END $$;

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
