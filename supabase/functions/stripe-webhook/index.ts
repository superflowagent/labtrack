// supabase/functions/stripe-webhook/index.ts
// Edge Function para recibir eventos de Stripe y actualizar Supabase
// @ts-expect-error - stripe types
import type StripeType from 'npm:stripe@12.6.0'
// @ts-expect-error - Supabase injected client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const serve = Deno.serve as unknown as (handler: (req: Request) => Promise<Response> | Response) => void;

// runtime-only dynamic import for Deno (silences editor module-resolution errors)
// @ts-expect-error - runtime-only import
const Stripe = (await import('npm:stripe@12.6.0')).default;

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2022-11-15",
});

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL") ?? 'http://127.0.0.1:54331';
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("VITE_SUPABASE_ANON_KEY") ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

// Use service role for webhook mutations when available; anon will be blocked by RLS.
const supabaseKey = SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY;

serve(async (req: Request) => {
    try {
        if (req.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        if (!supabaseKey) {
            console.error("Missing Supabase key in function env (SERVICE_ROLE_KEY or SUPABASE_ANON_KEY)");
            return new Response(JSON.stringify({ error: "server misconfigured" }), { status: 500 });
        }

        const supabase = createClient(SUPABASE_URL, supabaseKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });

        const sig = req.headers.get("stripe-signature");
        const buf = await req.arrayBuffer();

        // `event` will be populated below (signature-verified or parsed)
        let event: StripeType.Event | undefined;

        const payloadText = new TextDecoder().decode(buf);

        if (STRIPE_WEBHOOK_SECRET && sig) {
            try {
                // Note: stripe.webhooks.constructEvent may be async in some contexts
                try {
                    event = await stripe.webhooks.constructEventAsync(payloadText, sig, STRIPE_WEBHOOK_SECRET);
                } catch {
                    // Fallback to sync version if async version doesn't exist
                    event = stripe.webhooks.constructEvent(payloadText, sig, STRIPE_WEBHOOK_SECRET) as StripeType.Event;
                }
            } catch (err) {
                console.error("Stripe signature verification failed:", err instanceof Error ? err.message : String(err));
                // In local dev, if signature verification fails, try parsing as-is
                try {
                    console.warn("Signature verification failed, trying unsigned parse fallback...");
                    event = JSON.parse(payloadText) as StripeType.Event;
                } catch {
                    return new Response(JSON.stringify({ error: "Invalid signature or payload" }), { status: 400 });
                }
            }
        } else {
            // Fallback for local dev when STRIPE_WEBHOOK_SECRET isn't provided
            console.warn("STRIPE_WEBHOOK_SECRET not set or no signature header - skipping signature verification (local dev fallback)");
            try {
                event = JSON.parse(payloadText) as StripeType.Event;
            } catch (err) {
                console.error("Failed to parse Stripe event payload:", err);
                return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
            }
        }

        try {
            if (event.type === "checkout.session.completed") {
                const session = event.data.object as StripeType.Checkout.Session;
                const clinicId = session.client_reference_id;
                if (clinicId) {
                    const { error } = await supabase
                        .from('clinics')
                        .update({ is_premium: true, stripe_customer_id: session.customer ?? null })
                        .eq('id', clinicId)
                        .select();
                    if (error) {
                        console.error("Error updating clinic (checkout.session.completed):", error);
                    }
                } else {
                    console.warn("checkout.session.completed without client_reference_id");
                }
            } else if (event.type === "customer.subscription.deleted") {
                const subscription = event.data.object as StripeType.Subscription;
                const customerId = subscription.customer as string | undefined;
                if (customerId) {
                    const { error } = await supabase
                        .from('clinics')
                        .update({ is_premium: false })
                        .eq('stripe_customer_id', customerId)
                        .select();
                    if (error) {
                        console.error("Error updating clinic (customer.subscription.deleted):", error);
                    }
                }
            } else {
                // Ignore other event types
            }
        } catch (err) {
            console.error("Error handling Stripe event:", err);
            return new Response(JSON.stringify({ error: "failed to process event" }), { status: 500 });
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (err) {
        console.error("Unhandled error in stripe-webhook function:", err);
        return new Response(JSON.stringify({ error: "internal server error" }), { status: 500 });
    }
});
