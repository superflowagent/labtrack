/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import Stripe from 'stripe'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY')
if (!STRIPE_WEBHOOK_SECRET) throw new Error('Missing STRIPE_WEBHOOK_SECRET')
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing Supabase envs')

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })

addEventListener('fetch', (event) => {
    event.respondWith(handle(event.request))
})

async function updateClinicById(clinicId: string, payload: Record<string, unknown>) {
    await fetch(`${SUPABASE_URL}/rest/v1/clinics?id=eq.${clinicId}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
        },
        body: JSON.stringify(payload),
    })
}

async function updateClinicByCustomer(customerId: string, payload: Record<string, unknown>) {
    await fetch(`${SUPABASE_URL}/rest/v1/clinics?stripe_customer_id=eq.${customerId}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
        },
        body: JSON.stringify(payload),
    })
}

async function handle(req: Request) {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
    const buf = await req.text()
    const sig = req.headers.get('stripe-signature') || ''

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET)
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        return new Response(`Webhook Error: ${msg}`, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const metadata = (session.metadata && typeof session.metadata === 'object') ? (session.metadata as Record<string, string>) : undefined
                const clinicId = metadata?.clinic_id
                if (clinicId) {
                    await updateClinicById(clinicId, {
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: session.subscription as string || null,
                    })
                }
                break
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const sub = event.data.object as Stripe.Subscription
                const priceId = sub.items?.data?.[0]?.price?.id || null
                await updateClinicByCustomer(sub.customer as string, {
                    stripe_subscription_id: sub.id,
                    subscription_status: sub.status,
                    subscription_current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
                    stripe_trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
                    price_id: priceId,
                })
                break
            }

            case 'customer.subscription.deleted': {
                const sub = event.data.object as Stripe.Subscription
                await updateClinicByCustomer(sub.customer as string, {
                    stripe_subscription_id: null,
                    subscription_status: 'canceled',
                    subscription_current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
                })
                break
            }

            case 'invoice.paid': {
                const invoice = event.data.object as Stripe.Invoice
                // Mark clinic as active if subscription exists
                if (invoice.customer) {
                    await updateClinicByCustomer(invoice.customer as string, { subscription_status: 'active' })
                }
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice
                if (invoice.customer) {
                    await updateClinicByCustomer(invoice.customer as string, { subscription_status: 'past_due' })
                }
                break
            }

            default:
                // ignore other events
                break
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        return new Response(JSON.stringify({ error: message }), { status: 500 })
    }
} 
