# Stripe → Supabase Webhook Sync

Este microservicio escucha eventos de Stripe y actualiza la tabla `clinics` en Supabase en tiempo real.

## ¿Qué hace?
- Recibe eventos de Stripe (`customer.subscription.created|updated|deleted`)
- Busca la clínica correspondiente por `stripe_customer_id`
- Actualiza los campos de suscripción en Supabase (`subscription_status`, `stripe_subscription_id`, `stripe_trial_end`)

## Variables de entorno necesarias
- `STRIPE_SECRET_KEY` (clave secreta de Stripe)
- `STRIPE_WEBHOOK_SECRET` (se obtiene al crear el endpoint webhook en Stripe)
- `SUPABASE_URL` (URL de tu proyecto Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` (clave service role de Supabase)
- `PORT` (opcional, por defecto 3005)

## Uso local
1. Instala dependencias:
   ```sh
   npm install express stripe @supabase/supabase-js
   ```
2. Crea un archivo `.env` con las variables necesarias.
3. Ejecuta el servidor:
   ```sh
   node tools/stripe-webhook-sync/index.ts
   ```
4. En Stripe Dashboard, configura el endpoint webhook a `http://TU_DOMINIO/webhook` y copia el `STRIPE_WEBHOOK_SECRET`.

## Seguridad
- El endpoint solo acepta eventos firmados por Stripe.
- Usa la Service Role Key solo en backend seguro.

## Producción
Puedes desplegar este microservicio en Vercel, Render, Railway, Fly.io, etc.
