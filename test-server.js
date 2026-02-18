import dotenv from 'dotenv'
import express from 'express';

// load local env when running `node test-server.js`
dotenv.config({ path: '.env.local' })

const app = express();

const allowedOrigins = new Set(['http://localhost:5173']);

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.has(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

console.log('Creating test server...');

// Middleware
app.use(express.json());
console.log('Middleware registered');

// Routes
app.get('/test', (req, res) => {
    console.log('GET /test called');
    res.json({ status: 'ok' });
});

// Dev helper: create a Stripe Billing Portal session for a clinic
app.post('/api/portal', express.json(), async (req, res) => {
    try {
        const { clinicId } = req.body || {}
        if (!clinicId) return res.status(400).json({ error: 'clinicId is required' })

        const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
        const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY
        if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return res.status(500).json({ error: 'server misconfigured' })

        // fetch clinic row (server-side) to validate ownership & get stripe_customer_id
        const clinicResp = await fetch(`${SUPABASE_URL}/rest/v1/clinics?id=eq.${clinicId}&select=stripe_customer_id,is_premium,user_id`, {
            headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
        })
        if (!clinicResp.ok) return res.status(404).json({ error: 'clinic not found' })
        const clinics = await clinicResp.json()
        const clinic = Array.isArray(clinics) ? clinics[0] : clinics
        if (!clinic) return res.status(404).json({ error: 'clinic not found' })
        if (!clinic.is_premium) return res.status(400).json({ error: 'clinic is not premium' })
        if (!clinic.stripe_customer_id) return res.status(400).json({ error: 'no stripe customer id' })

        const stripeSecret = process.env.STRIPE_SECRET_KEY
        if (!stripeSecret) return res.status(500).json({ error: 'Stripe not configured' })
        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(stripeSecret, { apiVersion: '2026-01-28.clover' })

        const origin = req.headers.origin || process.env.VITE_APP_URL || 'http://localhost:5173'
        const returnUrl = String(origin).replace(/\/$/, '') + '/dashboard'
        let session
        try {
            session = await stripe.billingPortal.sessions.create({ customer: clinic.stripe_customer_id, return_url: returnUrl })
        } catch (err) {
            console.error('Stripe error creating portal session:', err)
            if (err && err.code === 'resource_missing') {
                return res.status(400).json({ error: 'Stripe customer not found' })
            }
            return res.status(500).json({ error: 'Stripe error' })
        }
        return res.json({ url: session.url })
    } catch (err) {
        console.error('POST /api/portal error', err)
        return res.status(500).json({ error: 'internal error' })
    }
});

// Dev helper: create a Stripe checkout session for a clinic subscription
app.post('/api/checkout', express.json(), async (req, res) => {
    try {
        const { clinicId, userEmail } = req.body || {}
        if (!clinicId) return res.status(400).json({ error: 'clinicId is required' })

        const stripeSecret = process.env.STRIPE_SECRET_KEY
        if (!stripeSecret) return res.status(500).json({ error: 'Stripe not configured' })
        
        const priceId = process.env.STRIPE_PRICE_ID
        if (!priceId) return res.status(500).json({ error: 'STRIPE_PRICE_ID not configured' })

        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(stripeSecret, { apiVersion: '2026-01-28.clover' })

        const origin = req.headers.origin || process.env.VITE_APP_URL || 'http://localhost:5173'
        const baseUrl = String(origin).replace(/\/$/, '')
        
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/dashboard?payment=success`,
            cancel_url: `${baseUrl}/clinic-settings`,
            customer_email: userEmail || undefined,
            // This is the key: storing the clinic ID in the session so the webhook can use it
            client_reference_id: clinicId,
        })

        return res.json({ sessionId: session.id, url: session.url })
    } catch (err) {
        console.error('Stripe checkout session creation error:', err)
        return res.status(500).json({ 
            error: err instanceof Error ? err.message : 'Failed to create checkout session' 
        })
    }
});

app.post('/poll/:id', (req, res) => {
    console.log('POST /poll/:id called with id:', req.params.id);
    res.json({ id: req.params.id });
});

app.listen(3001, () => {
    console.log('Server listening on port 3001');
});
