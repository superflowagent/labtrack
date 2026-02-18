import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
})

export async function POST(req: NextRequest) {
    const { clinicId, userEmail } = await req.json()

    if (!clinicId) {
        return NextResponse.json({ error: 'Missing clinicId' }, { status: 400 })
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID!,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/dashboard?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/clinic-settings`,
            customer_email: userEmail,
            // This is the key: storing the clinic ID in the session so we can use it in the webhook
            client_reference_id: clinicId,
        })

        return NextResponse.json({ sessionId: session.id, url: session.url }, { status: 200 })
    } catch (error) {
        console.error('Stripe checkout session creation error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}
