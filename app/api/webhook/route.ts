export async function GET() {
    return NextResponse.json({ status: 'ok', message: 'Stripe webhook endpoint is live.' })
}
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-01-28.clover' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

async function updateClinic(id: string, data: Partial<{ is_premium: boolean; stripe_customer_id: string }>) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/clinics?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
    })
    return res.ok
}

export async function POST(req: NextRequest) {
    const sig = req.headers.get('stripe-signature')
    const buf = await req.arrayBuffer()
    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(Buffer.from(buf), sig!, STRIPE_WEBHOOK_SECRET)
    } catch {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const clinicId = session.client_reference_id
        const customerId = session.customer as string
        if (clinicId && customerId) {
            await updateClinic(clinicId, { is_premium: true, stripe_customer_id: customerId })
        }
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        // Find clinic by stripe_customer_id and set is_premium false
        await fetch(`${SUPABASE_URL}/rest/v1/clinics?stripe_customer_id=eq.${customerId}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation',
            },
            body: JSON.stringify({ is_premium: false }),
        })
    }

    return NextResponse.json({ received: true })
}
