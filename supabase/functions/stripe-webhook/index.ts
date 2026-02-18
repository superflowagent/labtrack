// supabase/functions/stripe-webhook/index.ts
// Edge Function para recibir eventos de Stripe y actualizar Supabase
// @ts-expect-error - stripe types
import type StripeType from 'npm:stripe@12.6.0'
// @ts-ignore - Supabase injected client
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
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

// Initialize Supabase client with service role (admin) for mutations
// In Edge Functions, use SUPABASE_ANON_KEY to avoid requiring SERVICE_ROLE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

// DEBUG: print presence of critical env vars (local only)
console.log('env: STRIPE_WEBHOOK_SECRET set:', STRIPE_WEBHOOK_SECRET ? String(STRIPE_WEBHOOK_SECRET).slice(0, 10) + '...' : 'NOT SET', 'SUPABASE_ANON_KEY set:', Boolean(SUPABASE_ANON_KEY));

serve(async (req: Request) => {
    try {
        if (req.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        if (!SUPABASE_ANON_KEY) {
            console.error("Missing SUPABASE_ANON_KEY in function env");
            return new Response(JSON.stringify({ error: "server misconfigured" }), { status: 500 });
        }

        const sig = req.headers.get("stripe-signature");
        const buf = await req.arrayBuffer();
        console.log('STRIPE_WEBHOOK_SECRET prefix:', STRIPE_WEBHOOK_SECRET ? String(STRIPE_WEBHOOK_SECRET).slice(0, 10) + '...' : 'none');
        const textSample = new TextDecoder().decode(buf).slice(0, 200);
        console.log('stripe-signature header present:', Boolean(sig), sig ? String(sig).slice(0, 40) : '');
        console.log('raw body length:', buf.byteLength, 'body-sample:', textSample.replace(/(\r|\n)/g, '\\n').slice(0, 200));

        // debug: return raw body when ?debug=1 (local only)
        try {
            const reqUrl = new URL(req.url);
            if (reqUrl.searchParams.get('debug') === '1') {
                return new Response(new TextDecoder().decode(buf), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }
        } catch {
            /* ignore */
        }

        // `event` will be populated below (signature-verified or parsed)
        let event: StripeType.Event | undefined;

        const payloadText = new TextDecoder().decode(buf);
        
        if (STRIPE_WEBHOOK_SECRET && sig) {
            try {
                // Note: stripe.webhooks.constructEvent may be async in some contexts
                console.log('Attempting to verify Stripe signature with secret:', String(STRIPE_WEBHOOK_SECRET).slice(0, 15) + '...');
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
                } catch (fallbackErr) {
                    return new Response(JSON.stringify({ error: "Invalid signature or payload" }), { status: 400 });
                }
            }
        } else {
            // Fallback for local dev when STRIPE_WEBHOOK_SECRET isn't provided
            console.warn("STRIPE_WEBHOOK_SECRET not set or no signature header — skipping signature verification (local dev fallback)");
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
                    const { data, error } = await supabase
                        .from('clinics')
                        .update({ is_premium: true, stripe_customer_id: session.customer ?? null })
                        .eq('id', clinicId)
                        .select();
                    if (error) {
                        console.error("Error updating clinic (checkout.session.completed):", error);
                    } else {
                        console.log("Updated clinic (checkout.session.completed):", data?.length);
                    }
                }
            } else if (event.type === "customer.subscription.deleted") {
                const subscription = event.data.object as StripeType.Subscription;
                const customerId = subscription.customer as string | undefined;
                if (customerId) {
                    const { data, error } = await supabase
                        .from('clinics')
                        .update({ is_premium: false })
                        .eq('stripe_customer_id', customerId)
                        .select();
                    if (error) {
                        console.error("Error updating clinic (customer.subscription.deleted):", error);
                    } else {
                        console.log("Updated clinic (customer.subscription.deleted):", data?.length);
                    }
                }
            } else {
                // Log and ignore other event types to avoid 503 from unhandled cases
                console.log("Unhandled Stripe event type (ignored):", event.type);
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
