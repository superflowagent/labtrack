#!/usr/bin/env node
// Local webhook server to receive Stripe events and update the database

import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const { Client } = pg;

const app = express();
const PORT = 3001;

console.log('[INIT] Creating Express app...');

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

// Parse JSON for all requests (except webhook which needs raw)
app.use((req, res, next) => {
    if (req.path.startsWith('/webhook')) {
        // For webhook: preserve raw body for HMAC verification
        express.raw({ type: 'application/json' })(req, res, next);
    } else {
        // For all other endpoints: parse JSON
        express.json()(req, res, next);
    }
});
console.log('[INIT] Middleware registered');

// Database connection details
const dbConfig = {
    connectionString: "postgresql://postgres:postgres@127.0.0.1:54330/postgres"
};

async function updateClinicByCustomer(customerId, payload) {
    const client = new Client(dbConfig);
    try {
        await client.connect();

        // First try: find by stripe_customer_id (if already linked)
        let res = await client.query(
            `UPDATE public.clinics 
       SET stripe_subscription_id = $1,
           subscription_status = $2,
           stripe_trial_end = $3
       WHERE stripe_customer_id = $4
       RETURNING id, stripe_customer_id, subscription_status`,
            [
                payload.stripe_subscription_id || null,
                payload.subscription_status,
                payload.stripe_trial_end || null,
                customerId
            ]
        );

        if (res.rows.length > 0) {
            console.log('✅ Updated clinic (by stripe_customer_id):', res.rows[0].id);
            return;
        }

        // Second try: if customer email is provided, find clinic by that user's email
        if (payload.customer_email) {
            console.log('Searching clinic by customer email:', payload.customer_email);
            res = await client.query(
                `UPDATE public.clinics 
           SET stripe_customer_id = $1,
               stripe_subscription_id = $2,
               subscription_status = $3,
               stripe_trial_end = $4
           WHERE user_id = (SELECT id FROM auth.users WHERE email = $5)
           RETURNING id, stripe_customer_id, subscription_status`,
                [
                    customerId,
                    payload.stripe_subscription_id || null,
                    payload.subscription_status,
                    payload.stripe_trial_end || null,
                    payload.customer_email
                ]
            );

            if (res.rows.length > 0) {
                console.log('✅ Updated clinic (by customer email):', res.rows[0].id);
                return;
            }
        }

        console.log('⚠️  No clinic found for customer:', customerId);
    } finally {
        await client.end();
    }
}

async function updateClinicById(clinicId, payload) {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        const res = await client.query(
            `UPDATE public.clinics 
       SET stripe_customer_id = $1,
           stripe_subscription_id = $2
       WHERE id = $3
       RETURNING id, stripe_customer_id`,
            [
                payload.stripe_customer_id,
                payload.stripe_subscription_id || null,
                clinicId
            ]
        );

        if (res.rows.length === 0) {
            console.log('⚠️  No clinic found with ID:', clinicId);
        } else {
            console.log('✅ Updated clinic:', res.rows[0].id);
        }
    } finally {
        await client.end();
    }
}

app.post('/webhook', async (req, res) => {
    console.log('[DEBUG] Webhook POST endpoint called');
    console.log('\n📨 Webhook received');

    try {
        const buf = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
        const event = JSON.parse(buf.toString());

        console.log('Event type:', event.type);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const metadata = session.metadata || {};
                const clinicId = metadata.clinic_id || session.client_reference_id;
                if (!clinicId) {
                    console.log('⚠️  Missing clinic reference on checkout.session.completed');
                    break;
                }
                console.log('Processing checkout for clinic:', clinicId);
                await updateClinicById(clinicId, {
                    stripe_customer_id: session.customer || null,
                    stripe_subscription_id: session.subscription || null,
                });
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const sub = event.data.object;
                console.log('Processing subscription for customer:', sub.customer);

                // Fetch customer email from Stripe to link with clinic
                let customerEmail = null;
                const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
                if (stripeSecretKey) {
                    try {
                        const customerRes = await fetch(
                            `https://api.stripe.com/v1/customers/${sub.customer}`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${stripeSecretKey}`,
                                }
                            }
                        );
                        if (customerRes.ok) {
                            const customer = await customerRes.json();
                            customerEmail = customer.email;
                            console.log('Customer email:', customerEmail);
                        }
                    } catch (err) {
                        console.error('Failed to fetch customer email:', err.message);
                    }
                }

                await updateClinicByCustomer(sub.customer, {
                    stripe_subscription_id: sub.id,
                    subscription_status: sub.status,
                    stripe_trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
                    customer_email: customerEmail,
                });
                break;
            }

            case 'customer.subscription.deleted': {
                const sub = event.data.object;
                console.log('Processing subscription deletion for customer:', sub.customer);
                await updateClinicByCustomer(sub.customer, {
                    stripe_subscription_id: null,
                    subscription_status: 'canceled',
                });
                break;
            }

            default:
                console.log('Ignoring event type:', event.type);
        }

        res.json({ received: true });
    } catch (err) {
        console.error('❌ Webhook error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Polling endpoint: called by frontend to sync subscription from Stripe
app.post('/poll/:clinicId', async (req, res) => {
    console.log('[DEBUG] Polling POST endpoint called with clinicId:', req.params.clinicId);
    try {
        const { clinicId } = req.params;
        const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

        if (!STRIPE_SECRET_KEY) {
            return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY env var' });
        }

        if (!clinicId) {
            return res.status(400).json({ error: 'Missing clinicId param' });
        }

        // Get clinic from database
        const dbClient = new Client(dbConfig);
        await dbClient.connect();

        let clinic = await dbClient.query('SELECT * FROM clinics WHERE id = $1', [clinicId]);

        if (clinic.rows.length === 0) {
            await dbClient.end();
            return res.status(404).json({ error: 'Clinic not found' });
        }

        clinic = clinic.rows[0];

        if (clinic.manual_premium) {
            await dbClient.end();
            console.log(`[POLL] Clinic ${clinicId}: manual premium enabled, skipping Stripe sync`);
            return res.json({ synced: true, status: 'manual', message: 'Manual premium enabled' });
        }
        let stripeCustId = clinic.stripe_customer_id;

        // If no stripe_customer_id, look up by user email
        if (!stripeCustId && clinic.user_id) {
            const user = await dbClient.query('SELECT email FROM auth.users WHERE id = $1', [clinic.user_id]);

            if (user.rows.length > 0 && user.rows[0].email) {
                const userEmail = user.rows[0].email;
                console.log(`[POLL] Clinic ${clinicId}: no stripe_customer_id, looking up by email ${userEmail}`);

                // Search Stripe for customer with this email
                const stripeRes = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(userEmail)}&limit=1`, {
                    headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
                });

                const stripeData = await stripeRes.json();

                if (stripeData.data && stripeData.data.length > 0) {
                    stripeCustId = stripeData.data[0].id;
                    console.log(`[POLL] Found Stripe customer: ${stripeCustId}`);

                    // Save customer ID for future use
                    await dbClient.query('UPDATE clinics SET stripe_customer_id = $1 WHERE id = $2', [stripeCustId, clinicId]);
                }
            }
        }

        if (!stripeCustId) {
            await dbClient.end();
            return res.json({ synced: false, message: 'No Stripe customer found for clinic' });
        }

        // Query Stripe for latest subscription (sorted by created, most recent first)
        const subsRes = await fetch(
            `https://api.stripe.com/v1/customers/${stripeCustId}/subscriptions?limit=10`,
            {
                headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
            }
        );

        const subsData = await subsRes.json();

        let latestSub = subsData.data && subsData.data.length > 0 ? subsData.data[0] : null;

        if (!latestSub && clinic.user_id) {
            const user = await dbClient.query('SELECT email FROM auth.users WHERE id = $1', [clinic.user_id]);
            const userEmail = user.rows[0]?.email || null;

            if (userEmail) {
                console.log(`[POLL] Clinic ${clinicId}: no subscriptions on current customer, searching by email ${userEmail}`);

                const stripeRes = await fetch(
                    `https://api.stripe.com/v1/customers?email=${encodeURIComponent(userEmail)}&limit=10`,
                    { headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` } }
                );
                const stripeData = await stripeRes.json();

                if (stripeData.data && stripeData.data.length > 0) {
                    for (const customer of stripeData.data) {
                        const candidateRes = await fetch(
                            `https://api.stripe.com/v1/customers/${customer.id}/subscriptions?limit=10`,
                            { headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` } }
                        );
                        const candidateData = await candidateRes.json();
                        const candidateSub = candidateData.data && candidateData.data.length > 0 ? candidateData.data[0] : null;

                        if (candidateSub && (!latestSub || candidateSub.created > latestSub.created)) {
                            latestSub = candidateSub;
                            stripeCustId = customer.id;
                        }
                    }
                }
            }
        }

        if (!latestSub) {
            // No subscription - mark clinic as canceled/free (but keep stripe_customer_id for future syncs)
            await dbClient.query(
                `UPDATE clinics 
           SET stripe_subscription_id = NULL,
               subscription_status = 'canceled'
           WHERE id = $1`,
                [clinicId]
            );
            await dbClient.end();
            console.log(`[POLL] Clinic ${clinicId}: No subscriptions in Stripe - marked as free`);
            return res.json({ synced: true, status: 'canceled', message: 'No active subscription' });
        }

        const activeSub = latestSub;

        // Update clinic with subscription details
        await dbClient.query(
            `UPDATE clinics 
       SET stripe_subscription_id = $1, 
           subscription_status = $2, 
           stripe_trial_end = $3,
           stripe_customer_id = $4
       WHERE id = $5`,
            [
                activeSub.id,
                activeSub.status,
                activeSub.trial_end ? new Date(activeSub.trial_end * 1000).toISOString() : null,
                stripeCustId,
                clinicId,
            ]
        );

        await dbClient.end();

        console.log(`✅ [POLL] Clinic ${clinicId} synced with subscription ${activeSub.id}`);
        return res.json({
            synced: true,
            subscription_id: activeSub.id,
            status: activeSub.status,
        });
    } catch (err) {
        console.error('❌ Polling error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Create Stripe billing portal session
app.post('/create-portal-session/:clinicId', async (req, res) => {
    console.log('[PORTAL] Creating billing portal session for clinic:', req.params.clinicId);
    try {
        const { clinicId } = req.params;
        const { return_url } = req.body;
        const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

        if (!STRIPE_SECRET_KEY) {
            return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY env var' });
        }

        if (!clinicId) {
            return res.status(400).json({ error: 'Missing clinicId param' });
        }

        // Get clinic from database
        const dbClient = new Client(dbConfig);
        await dbClient.connect();

        const result = await dbClient.query(
            'SELECT id, stripe_customer_id, manual_premium FROM public.clinics WHERE id = $1',
            [clinicId]
        );

        if (result.rows.length === 0) {
            await dbClient.end();
            return res.status(404).json({ error: 'Clinic not found' });
        }

        const clinic = result.rows[0];

        if (clinic.manual_premium) {
            await dbClient.end();
            return res.status(400).json({ error: 'Manual premium enabled' });
        }

        if (!clinic.stripe_customer_id) {
            await dbClient.end();
            return res.status(400).json({ error: 'No Stripe customer found' });
        }

        await dbClient.end();

        // Create Stripe billing portal session
        const params = new URLSearchParams({
            customer: clinic.stripe_customer_id,
            return_url: return_url || 'http://localhost:5173/dashboard',
        });

        const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!portalRes.ok) {
            const text = await portalRes.text();
            console.error('[PORTAL] Stripe error:', text);
            return res.status(500).json({ error: text || 'Failed to create portal session' });
        }

        const portal = await portalRes.json();
        console.log('✅ [PORTAL] Portal session created:', portal.url);
        return res.json({ url: portal.url });
    } catch (err) {
        console.error('❌ Portal creation error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Webhook server listening on port ${PORT}`);
    console.log(`📍 Listen for Stripe events: stripe listen --forward-to http://localhost:${PORT}/webhook`);
    console.log(`🔄 Polling endpoint: POST http://localhost:${PORT}/poll/:clinicId`);
    console.log(`⚙️  STRIPE_SECRET_KEY loaded: ${process.env.STRIPE_SECRET_KEY ? '✅' : '❌'}`);
});
