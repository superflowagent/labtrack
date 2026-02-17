-- 1. Elimina función y policies relacionadas con suscripción/Stripe
DROP FUNCTION IF EXISTS public.check_subscription_status(text);
DROP POLICY IF EXISTS "Jobs are scoped to clinic" ON public.jobs;
DROP POLICY IF EXISTS "Laboratories are scoped to clinic" ON public.laboratories;
DROP POLICY IF EXISTS "Patients are scoped to clinic" ON public.patients;
DROP POLICY IF EXISTS "Specialists are scoped to clinic" ON public.specialists;

-- 2. Elimina columnas de suscripción/stripe de la tabla clinics
ALTER TABLE public.clinics
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id,
  DROP COLUMN IF EXISTS subscription_status,
  DROP COLUMN IF EXISTS stripe_trial_end,
  DROP COLUMN IF EXISTS manual_premium;

-- 3. Re-crea policies básicas de acceso a clinics sin lógica de suscripción
CREATE POLICY "Jobs are scoped to clinic" ON public.jobs USING ((clinic_id IN (SELECT clinics.id FROM public.clinics WHERE clinics.user_id = auth.uid()))) WITH CHECK ((clinic_id IN (SELECT clinics.id FROM public.clinics WHERE clinics.user_id = auth.uid())));
CREATE POLICY "Laboratories are scoped to clinic" ON public.laboratories USING ((clinic_id IN (SELECT clinics.id FROM public.clinics WHERE clinics.user_id = auth.uid()))) WITH CHECK ((clinic_id IN (SELECT clinics.id FROM public.clinics WHERE clinics.user_id = auth.uid())));
CREATE POLICY "Patients are scoped to clinic" ON public.patients USING ((clinic_id IN (SELECT clinics.id FROM public.clinics WHERE clinics.user_id = auth.uid()))) WITH CHECK ((clinic_id IN (SELECT clinics.id FROM public.clinics WHERE clinics.user_id = auth.uid())));
CREATE POLICY "Specialists are scoped to clinic" ON public.specialists USING ((clinic_id IN (SELECT clinics.id FROM public.clinics WHERE clinics.user_id = auth.uid()))) WITH CHECK ((clinic_id IN (SELECT clinics.id FROM public.clinics WHERE clinics.user_id = auth.uid())));
