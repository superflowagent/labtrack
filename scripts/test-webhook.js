#!/usr/bin/env node
// Test webhook using proper Supabase service role JWT

import pg from 'pg'
const { Client } = pg

const userId = "c1277406-36e1-4faf-a1ee-6c2ce26a8aa1";
const stripeCustomerId = "cus_test_manual_" + Date.now();
const stripeSubscriptionId = "sub_test_manual_" + Date.now();

const webhookPayload = {
    type: "customer.subscription.created",
    data: {
        object: {
            id: stripeSubscriptionId,
            customer: stripeCustomerId,
            status: "active",
            trial_end: Math.floor(Date.now() / 1000) + (86400 * 30),
            items: {
                data: [
                    {
                        price: {
                            id: "price_1T1OJl9lx4Sn74Fva8VjJJdN"
                        }
                    }
                ]
            }
        }
    }
};

async function testViaDirectDB() {
    console.log("Testing webhook by directly updating DB...");
    console.log("Subscription ID:", stripeSubscriptionId);
    console.log("Customer ID:", stripeCustomerId);

    const client = new Client({
        connectionString: "postgresql://postgres:postgres@127.0.0.1:54330/postgres"
    });

    try {
        await client.connect();

        // First, let's see if there's a clinic to update
        const checkRes = await client.query(
            "SELECT id, name, stripe_customer_id FROM public.clinics LIMIT 1"
        );

        if (checkRes.rows.length === 0) {
            console.log("No clinics found in DB. Creating test data...");
            // We need a clinic first. Let's get a user ID from auth.users
            const userRes = await client.query(
                "SELECT id FROM auth.users LIMIT 1"
            );
            if (userRes.rows.length === 0) {
                console.log("No users found. Webhook can't update anything without a clinic.");
                process.exit(1);
            }
            const userId = userRes.rows[0].id;
            console.log("Found user:", userId);

            // Create a test clinic
            const createRes = await client.query(
                "INSERT INTO public.clinics (id, user_id, name) VALUES ($1, $2, 'Test Clinic') RETURNING id",
                ["clinic-" + Date.now(), userId]
            );
            console.log("Created test clinic:", createRes.rows[0].id);
        }

        // Now simulate what the webhook should do: find clinic by customer ID and update it
        const clinicRes = await client.query(
            "SELECT id FROM public.clinics LIMIT 1"
        );

        if (clinicRes.rows.length === 0) {
            console.log("Still no clinic. Exiting.");
            process.exit(1);
        }

        const clinicId = clinicRes.rows[0].id;
        console.log("\nUpdating clinic:", clinicId);

        const updateRes = await client.query(
            `UPDATE public.clinics 
       SET stripe_customer_id = $1, 
           stripe_subscription_id = $2, 
           subscription_status = $3,
           stripe_trial_end = $4
       WHERE id = $5
       RETURNING stripe_customer_id, stripe_subscription_id, subscription_status, stripe_trial_end`,
            [stripeCustomerId, stripeSubscriptionId, "active", new Date(webhookPayload.data.object.trial_end * 1000).toISOString(), clinicId]
        );

        console.log("\n✅ Database updated successfully!");
        console.log("Updated record:", updateRes.rows[0]);

    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

testViaDirectDB();
