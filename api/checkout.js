import Stripe from 'stripe'

const stripeSecret = process.env.STRIPE_SECRET_KEY
const priceId = process.env.STRIPE_PRICE_ID

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    if (!stripeSecret || !priceId) {
        return res.status(500).json({ error: 'Server misconfigured' })
    }

    let body
    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    } catch {
        return res.status(400).json({ error: 'Invalid JSON body' })
    }

    const clinicId = body?.clinicId
    const userEmail = body?.userEmail

    if (!clinicId) {
        return res.status(400).json({ error: 'Missing clinicId' })
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2026-01-28.clover' })
    const host = req.headers.host
    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.VITE_APP_URL ||
        (host ? `https://${host}` : undefined)

    if (!baseUrl) {
        return res.status(500).json({ error: 'Missing app URL' })
    }

    try {
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
            customer_email: userEmail,
            client_reference_id: clinicId,
        })

        return res.status(200).json({ sessionId: session.id, url: session.url })
    } catch (error) {
        console.error('Stripe checkout session creation error:', error)
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to create checkout session',
        })
    }
}
