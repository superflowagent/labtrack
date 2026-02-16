/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import Stripe from 'stripe'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY')
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing Supabase envs')

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })

addEventListener('fetch', (event) => {
    event.respondWith(handle(event.request))
})

async function handle(req: Request) {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
    try {
        const { subscription_id, action } = await req.json()
        if (!subscription_id || !action) return new Response(JSON.stringify({ error: 'subscription_id and action required' }), { status: 400 })

        let updated: Stripe.Response<Stripe.Subscription>
        if (action === 'cancel') {
            updated = await stripe.subscriptions.update(subscription_id, { cancel_at_period_end: true })
        } else if (action === 'reactivate') {
            // reactivate by setting cancel_at_period_end to false
            updated = await stripe.subscriptions.update(subscription_id, { cancel_at_period_end: false })
        } else {
            return new Response(JSON.stringify({ error: 'unknown action' }), { status: 400 })
        }

        // update clinics table by stripe_subscription_id
        await fetch(`${SUPABASE_URL}/rest/v1/clinics?stripe_subscription_id=eq.${subscription_id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=representation',
            },
            body: JSON.stringify({ subscription_status: updated.status }),
        })

        return new Response(JSON.stringify({ status: updated.status }), { status: 200 })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        return new Response(JSON.stringify({ error: message }), { status: 500 })
    }
} 
