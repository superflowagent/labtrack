// supabase/functions/stripe-webhook/index.ts
// Edge Function para recibir eventos de Stripe y actualizar Supabase
import type StripeType from 'stripe'

const serve = Deno.serve as unknown as (handler: (req: Request) => Promise<Response> | Response) => void;

// runtime-only dynamic import for Deno (silences editor module-resolution errors)
// @ts-expect-error - runtime-only import
const Stripe = (await import('npm:stripe@12.6.0')).default as unknown as typeof import('stripe').default;

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2022-11-15",
});

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// SERVICE_ROLE_KEY used for local Edge Functions (.env.local can't inject names starting with SUPABASE_)
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

// DEBUG: print presence of critical env vars (local only)
console.log('env: SERVICE_ROLE_KEY:', Boolean(Deno.env.get('SERVICE_ROLE_KEY')), 'STRIPE_WEBHOOK_SECRET set:', STRIPE_WEBHOOK_SECRET ? String(STRIPE_WEBHOOK_SECRET).slice(0, 10) + '...' : false);

serve(async (req: Request) => {
    try {
        if (req.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        if (!SUPABASE_SERVICE_ROLE_KEY) {
            console.error("Missing SUPABASE service role key in function env (SERVICE_ROLE_KEY)");
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

        if (STRIPE_WEBHOOK_SECRET) {
            try {
                // use text payload for verification (avoids issues with byte/encoding differences through gateway)
                const payloadText = new TextDecoder().decode(buf);
                event = stripe.webhooks.constructEvent(payloadText, sig!, STRIPE_WEBHOOK_SECRET);
            } catch (err) {
                console.error("Stripe signature verification failed:", err);
                return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
            }
        } else {
            // Fallback for local dev when STRIPE_WEBHOOK_SECRET isn't provided to the Edge runtime.
            // Parse the raw body directly (Stripe CLI / `stripe trigger` will still work).
            console.warn("STRIPE_WEBHOOK_SECRET not set — skipping signature verification (local only)");
            try {
                const text = new TextDecoder().decode(buf);
                event = JSON.parse(text) as StripeType.Event;
            } catch (err) {
                console.error("Failed to parse Stripe event payload without signature:", err);
                return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
            }
        }

        try {
            if (event.type === "checkout.session.completed") {
                const session = event.data.object as StripeType.Checkout.Session;
                const clinicId = session.client_reference_id;
                if (clinicId) {
                    const res = await fetch(`${SUPABASE_URL}/rest/v1/clinics?id=eq.${clinicId}`, {
                        method: "PATCH",
                        headers: {
                            apikey: SUPABASE_SERVICE_ROLE_KEY,
                            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                            "Content-Type": "application/json",
                            Prefer: "return=representation",
                        },
                        body: JSON.stringify({ is_premium: true, stripe_customer_id: session.customer ?? null }),
                    });
                    console.log("PATCH clinics (checkout.session.completed)", res.status);
                }
            } else if (event.type === "customer.subscription.deleted") {
                const subscription = event.data.object as StripeType.Subscription;
                const customerId = subscription.customer as string | undefined;
                if (customerId) {
                    const res = await fetch(`${SUPABASE_URL}/rest/v1/clinics?stripe_customer_id=eq.${customerId}`, {
                        method: "PATCH",
                        headers: {
                            apikey: SUPABASE_SERVICE_ROLE_KEY,
                            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                            "Content-Type": "application/json",
                            Prefer: "return=representation",
                        },
                        body: JSON.stringify({ is_premium: false }),
                    });
                    console.log("PATCH clinics (customer.subscription.deleted)", res.status);
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
