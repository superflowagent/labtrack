/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import Stripe from 'stripe'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:5173'

if (!STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY')
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing Supabase envs')

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })

addEventListener('fetch', (event) => {
    event.respondWith(handle(event.request))
})

async function handle(req: Request) {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
    try {
        const { customer_id } = await req.json()
        if (!customer_id) return new Response(JSON.stringify({ error: 'customer_id required' }), { status: 400 })

        const session = await stripe.billingPortal.sessions.create({
            customer: customer_id,
            return_url: SITE_URL + '/dashboard',
        })

        return new Response(JSON.stringify({ url: session.url }), { status: 200 })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        return new Response(JSON.stringify({ error: message }), { status: 500 })
    }
} 
