#!/usr/bin/env node
/**
 * Simple polling script to sync Stripe subscription to database
 * Usage: node scripts/sync-subscription.js <clinic-id>
 */

import postgres from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const { Client } = postgres;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
    process.exit(1);
}

const clinicId = process.argv[2];
if (!clinicId) {
    console.error('Usage: node scripts/sync-subscription.js <clinic-id>');
    process.exit(1);
}

const dbConfig = {
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54330/postgres',
};

async function syncSubscription(clinicId) {
    const client = new Client(dbConfig);

    try {
        await client.connect();
        console.log(`🔄 Syncing subscription for clinic ${clinicId}...`);

        // Get clinic
        let res = await client.query('SELECT * FROM clinics WHERE id = $1', [clinicId]);

        if (res.rows.length === 0) {
            console.error(`❌ Clinic ${clinicId} not found`);
            return;
        }

        const clinic = res.rows[0];
        let stripeCustId = clinic.stripe_customer_id;
        let userEmail = null;

        if (clinic.user_id) {
            const userRes = await client.query('SELECT email FROM auth.users WHERE id = $1', [clinic.user_id]);
            userEmail = userRes.rows[0]?.email || null;
        }

        const getLatestSubForCustomer = async (customerId) => {
            const subsRes = await fetch(`https://api.stripe.com/v1/customers/${customerId}/subscriptions?limit=10`, {
                headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
            });
            const subsData = await subsRes.json();
            const sub = subsData.data && subsData.data.length > 0 ? subsData.data[0] : null;
            return sub ? { customerId, sub } : null;
        };

        let latest = null;

        if (stripeCustId) {
            latest = await getLatestSubForCustomer(stripeCustId);
        }

        if (!latest && userEmail) {
            console.log(`   Looking up customer by email: ${userEmail}`);

            const stripeRes = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(userEmail)}&limit=10`, {
                headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
            });
            const stripeData = await stripeRes.json();

            if (stripeData.data && stripeData.data.length > 0) {
                for (const customer of stripeData.data) {
                    const candidate = await getLatestSubForCustomer(customer.id);
                    if (candidate && (!latest || candidate.sub.created > latest.sub.created)) {
                        latest = candidate;
                    }
                }
            }
        }

        if (!latest) {
            console.log('   ℹ️  No subscriptions found - user is not a paid subscriber')

            // Mark clinic as free/canceled (but keep stripe_customer_id for future syncs)
            await client.query(
                `UPDATE clinics 
           SET stripe_subscription_id = NULL,
               subscription_status = 'canceled'
           WHERE id = $1`,
                [clinicId]
            );
            console.log(`✅ Clinic marked as free (no subscriptions in Stripe)`);
            return;
        }

        stripeCustId = latest.customerId;
        const sub = latest.sub;
        console.log(`   Found subscription: ${sub.id} (status: ${sub.status})`);

        if (sub.status === 'active') {
            console.log(`   ✅ Subscription is ACTIVE`);
        } else if (sub.status === 'trialing') {
            console.log(`   ℹ️  Subscription is TRIALING (trial period active)`);
        } else if (sub.status === 'past_due') {
            console.log(`   ⚠️  Subscription is PAST_DUE (payment failed)`);
        } else if (sub.status === 'incomplete') {
            console.log(`   ⚠️  Subscription is INCOMPLETE (waiting for payment)`);
        } else if (sub.status === 'canceled') {
            console.log(`   ⚠️  Subscription is CANCELED - user is no longer a subscriber`);
        } else if (sub.status === 'paused') {
            console.log(`   ⚠️  Subscription is PAUSED`);
        }

        // Update clinic
        await client.query(
            `UPDATE clinics 
       SET stripe_customer_id = $1,
           stripe_subscription_id = $2,
           subscription_status = $3,
           stripe_trial_end = $4
       WHERE id = $5`,
            [
                stripeCustId,
                sub.id,
                sub.status,
                sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
                clinicId,
            ]
        );

        console.log(`✅ Clinic updated successfully!`);
        console.log(`   Subscription ID: ${sub.id}`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   Trial End: ${sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : 'None'}`);
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

syncSubscription(clinicId);
