# Despliegue rápido en Vercel

1. Sube el contenido de `tools/stripe-webhook-sync` a un nuevo repo (o subcarpeta de tu monorepo).
2. Entra a [Vercel](https://vercel.com/) y crea un nuevo proyecto desde ese repo.
3. Añade las variables de entorno en Settings > Environment Variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PORT` (opcional)
4. El endpoint público será: `https://TU_PROYECTO.vercel.app/webhook`
5. Copia esa URL y configúrala como endpoint en el Dashboard de Stripe.
6. ¡Listo! Los eventos de Stripe actualizarán Supabase en tiempo real.

## Notas
- El archivo `vercel.json` ya enruta `/webhook` correctamente.
- Puedes usar Render, Railway, Fly.io, etc. con cambios mínimos.
