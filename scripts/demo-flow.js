#!/usr/bin/env node
// Demo script: Simulate complete Stripe payment flow

import pg from 'pg'
const { Client } = pg;

const dbConfig = {
    connectionString: "postgresql://postgres:postgres@127.0.0.1:54330/postgres"
};

async function runDemo() {
    const client = new Client(dbConfig);

    try {
        await client.connect();
        console.log("📋 === FLOW DEMO: User Registration → Trial → Payment → Subscription ===\n");

        // Step 1: Get a test user or create one
        console.log("1️⃣ Getting test user...");
        const userRes = await client.query(
            "SELECT id, email FROM auth.users WHERE email LIKE '%labtrack%' LIMIT 1"
        );

        let userId;
        if (userRes.rows.length > 0) {
            userId = userRes.rows[0].id;
            console.log("   ✅ Found test user:", userRes.rows[0].email);
        } else {
            console.log("   ⚠️  No test user found. Using demo mode.\n");
            userId = "test-user-" + Date.now();
        }

        // Step 2: Show clinic with trial
        console.log("\n2️⃣ Checking clinic registration (with 30-day trial)...");
        const clinicRes = await client.query(
            "SELECT id, name, subscription_status, stripe_trial_end FROM public.clinics WHERE user_id = $1 LIMIT 1",
            [userId]
        );

        if (clinicRes.rows.length > 0) {
            const clinic = clinicRes.rows[0];
            const trialEnd = new Date(clinic.stripe_trial_end);
            const now = new Date();
            const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));

            console.log(`   ✅ Clinic: ${clinic.name}`);
            console.log(`   📅 Status: ${clinic.subscription_status === 'trialing' ? 'TRIALING' : clinic.subscription_status}`);
            console.log(`   ⏱️  Trial ends: ${trialEnd.toLocaleDateString()} (${daysLeft} days left)`);
            console.log(`   💳 Can access dashboard: ${daysLeft > 0 ? 'YES ✅' : 'NO ❌'}`);
        } else {
            console.log('   ⚠️  No clinic registered. User would see trial prompt on first login.\n');
        }

        // Step 3: Simulate payment
        console.log("\n3️⃣ Simulating Stripe payment (Payment Link completed)...");
        console.log("   [User clicks 'Subscribe' → opens Payment Link](https://buy.stripe.com/test_8x25kx8Xb5HugTSdyJ1oI08)");
        console.log("   [User completes payment in Stripe]");

        // Simulate webhook update
        const stripeCustomerId = "cus_demo_" + Date.now();
        const stripeSubId = "sub_demo_" + Date.now();

        console.log("\n4️⃣ Stripe sends webhook: customer.subscription.created");
        console.log("   (Webhook is received by webhook-server.js and updates DB)");

        // Update clinic with subscription
        const updateRes = await client.query(
            `UPDATE public.clinics 
       SET stripe_customer_id = $1, 
           stripe_subscription_id = $2, 
           subscription_status = $3
       WHERE user_id = $4
       RETURNING id, name, subscription_status, stripe_customer_id`,
            [stripeCustomerId, stripeSubId, 'active', userId]
        );

        if (updateRes.rows.length > 0) {
            const clinic = updateRes.rows[0];
            console.log(`\n   ✅ Clinic updated successfully`);
            console.log(`   📝 Name: ${clinic.name}`);
            console.log(`   💳 Subscription Status: ${clinic.subscription_status}`);
            console.log(`   🔑 Stripe Customer ID: ${clinic.stripe_customer_id}`);
        }

        // Step 5: Verify access
        console.log("\n5️⃣ Dashboard access validation:");
        const finalRes = await client.query(
            `SELECT 
        subscription_status,
        stripe_trial_end,
        CASE 
          WHEN subscription_status = 'active' THEN 'PAID SUBSCRIPTION ✅'
          WHEN subscription_status = 'trialing' AND stripe_trial_end > NOW() THEN 'TRIAL ACTIVE ✅'
          ELSE 'NO ACCESS ❌'
        END as access
       FROM public.clinics 
       WHERE user_id = $1`,
            [userId]
        );

        if (finalRes.rows.length > 0) {
            const status = finalRes.rows[0];
            console.log(`   ${status.access}`);
            console.log(`   Status: ${status.subscription_status}`);
        }

        console.log("\n✨ === FLOW COMPLETE ===");
        console.log("\n🎯 Summary:");
        console.log("   1. User registers → Trial starts automatically (30 days)");
        console.log("   2. User accesses dashboard → Dashboard checks trial/subscription status");
        console.log("   3. User clicks 'Subscribe' → Opens Payment Link");
        console.log("   4. User completes payment → Stripe sends webhook");
        console.log("   5. Webhook updates DB → Dashboard now shows 'active' subscription");
        console.log("   6. User can keep accessing dashboard (no billing block)\n");

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await client.end();
    }
}

runDemo();
