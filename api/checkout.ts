import Stripe from 'stripe'

function getBaseUrl(req: { headers?: Record<string, string | string[]> }) {
    const headerOrigin = req.headers?.origin
    if (typeof headerOrigin === 'string' && headerOrigin.length > 0) {
        return headerOrigin.replace(/\/$/, '')
    }

    const envOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_APP_URL
    if (envOrigin && envOrigin.length > 0) {
        return envOrigin.replace(/\/$/, '')
    }

    return 'https://labtrack.es'
}

function parseBody(body: unknown) {
    if (!body) return {}
    if (typeof body === 'string') {
        try {
            return JSON.parse(body) as Record<string, unknown>
        } catch {
            return {}
        }
    }
    return body as Record<string, unknown>
}

export default async function handler(
    req: { method: string; body: unknown; headers?: Record<string, string | string[]> },
    res: {
        status: (code: number) => { json: (data: unknown) => unknown }
        json: (data: unknown) => unknown
    }
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY
    const priceId = process.env.STRIPE_PRICE_ID
    if (!stripeSecret || !priceId) {
        return res.status(500).json({ error: 'Server misconfigured' })
    }

    const body = parseBody(req.body)
    const clinicId = body.clinicId as string | undefined
    const userEmail = body.userEmail as string | undefined

    if (!clinicId) {
        return res.status(400).json({ error: 'Missing clinicId' })
    }

    try {
        const stripe = new Stripe(stripeSecret, { apiVersion: '2026-01-28.clover' })
        const baseUrl = getBaseUrl(req)

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${baseUrl}/dashboard?payment=success`,
            cancel_url: `${baseUrl}/clinic-settings`,
            customer_email: userEmail || undefined,
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
