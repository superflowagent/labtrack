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

async function fetchClinic(supabaseUrl: string, serviceRoleKey: string, clinicId: string) {
    const resp = await fetch(
        `${supabaseUrl}/rest/v1/clinics?id=eq.${clinicId}&select=stripe_customer_id,is_premium`,
        {
            headers: {
                apikey: serviceRoleKey,
                Authorization: `Bearer ${serviceRoleKey}`,
            },
        }
    )

    if (!resp.ok) return null
    const data = (await resp.json()) as Array<{
        stripe_customer_id: string | null
        is_premium: boolean
    }>

    return data?.[0] ?? null
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    const supabaseUrl =
        process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        return res.status(500).json({ error: 'Server misconfigured' })
    }

    const body = parseBody(req.body)
    const clinicId = body.clinicId as string | undefined
    if (!clinicId) {
        return res.status(400).json({ error: 'Missing clinicId' })
    }

    try {
        const clinic = await fetchClinic(supabaseUrl, serviceRoleKey, clinicId)
        if (!clinic) return res.status(404).json({ error: 'Clinic not found' })
        if (!clinic.is_premium) return res.status(400).json({ error: 'Clinic is not premium' })
        if (!clinic.stripe_customer_id) return res.status(400).json({ error: 'No Stripe customer id' })

        const stripeSecret = process.env.STRIPE_SECRET_KEY
        if (!stripeSecret) return res.status(500).json({ error: 'Stripe not configured' })

        const stripe = new Stripe(stripeSecret, { apiVersion: '2026-01-28.clover' })
        const baseUrl = getBaseUrl(req)

        const session = await stripe.billingPortal.sessions.create({
            customer: clinic.stripe_customer_id,
            return_url: `${baseUrl}/dashboard`,
        })

        return res.status(200).json({ url: session.url })
    } catch (error) {
        console.error('Stripe portal session creation error:', error)
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to create portal session',
        })
    }
}
