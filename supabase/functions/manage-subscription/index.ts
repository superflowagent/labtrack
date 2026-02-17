import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

export const config = {
    verifyJWT: true,
}

type DenoRuntime = {
    env: {
        get(key: string): string | undefined
    }
    serve: (handler: (req: Request) => Response | Promise<Response>) => void
}

const denoRuntime = (globalThis as unknown as { Deno: DenoRuntime }).Deno

const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    })

denoRuntime.serve(async (req: Request) => {
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

    try {
        const STRIPE_SECRET_KEY = denoRuntime.env.get('STRIPE_SECRET_KEY')
        const SUPABASE_URL = denoRuntime.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = denoRuntime.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            return json({ error: 'Missing env vars' }, 500)
        }

        const { clinic_id, return_url } = await req.json().catch(() => ({}))
        const returnUrl = return_url || req.headers.get('Origin') || 'http://localhost:5173'

        if (!clinic_id) {
            return json({ error: 'Missing clinic_id' }, 400)
        }

        const clinicRes = await fetch(
            `${SUPABASE_URL}/rest/v1/clinics?id=eq.${clinic_id}&select=id,stripe_customer_id,manual_premium`,
            {
                headers: {
                    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                    apikey: SUPABASE_SERVICE_ROLE_KEY,
                },
            }
        )

        if (!clinicRes.ok) return json({ error: 'Clinic not found' }, 404)

        const clinics = await clinicRes.json()
        const clinic = clinics[0]
        if (!clinic) return json({ error: 'Clinic not found' }, 404)

        if (clinic.manual_premium) {
            return json({ error: 'Manual premium enabled' }, 400)
        }

        if (!clinic.stripe_customer_id) {
            return json({ error: 'No Stripe customer found' }, 400)
        }

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        const portal = await stripe.billingPortal.sessions.create({
            customer: clinic.stripe_customer_id,
            return_url: returnUrl,
        })

        return json({ url: portal.url })
    } catch (err) {
        return json({ error: String(err) }, 500)
    }
})

