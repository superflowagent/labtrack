/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

export const config = {
    verifyJWT: false,
}

async function updateClinicById(clinicId: string, payload: Record<string, unknown>) {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)

        const res = await fetch(`${SUPABASE_URL}/rest/v1/clinics?id=eq.${clinicId}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=representation',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        })

        clearTimeout(timeout)
        if (!res.ok) {
            const text = await res.text()
            throw new Error(`Supabase PATCH failed: ${res.status} - ${text}`)
        }
    } catch (err) {
        console.error(`Error updating clinic by ID: ${err instanceof Error ? err.message : String(err)}`)
        throw err
    }
}

async function updateClinicByCustomer(customerId: string, payload: Record<string, unknown>) {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)

        const res = await fetch(`${SUPABASE_URL}/rest/v1/clinics?stripe_customer_id=eq.${customerId}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=representation',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        })

        clearTimeout(timeout)
        if (!res.ok) {
            const text = await res.text()
            throw new Error(`Supabase PATCH failed: ${res.status} - ${text}`)
        }
    } catch (err) {
        console.error(`Error updating clinic by customer: ${err instanceof Error ? err.message : String(err)}`)
        throw err
    }
}

async function handle(req: Request) {
    console.log('Webhook received:', req.method)

    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

    const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!STRIPE_WEBHOOK_SECRET) return new Response(JSON.stringify({ error: 'Missing STRIPE_WEBHOOK_SECRET' }), { status: 500 })
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return new Response(JSON.stringify({ error: 'Missing Supabase envs' }), { status: 500 })

    const buf = await req.text()

    let event: { type: string; data: { object: Record<string, unknown> } }
    try {
        event = JSON.parse(buf)
        console.log('Event type:', event.type)
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('Failed to parse webhook:', msg)
        return new Response(`Webhook Error: ${msg}`, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Record<string, unknown>
                const metadata = (session.metadata && typeof session.metadata === 'object') ? (session.metadata as Record<string, string>) : undefined
                const clinicId = metadata?.clinic_id
                if (clinicId) {
                    console.log('Updating clinic:', clinicId)
                    await updateClinicById(clinicId, {
                        stripe_customer_id: (session.customer as string) || null,
                        stripe_subscription_id: (session.subscription as string) || null,
                    })
                }
                break
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const sub = event.data.object as Record<string, unknown>
                console.log('Updating subscription for customer:', sub.customer)
                await updateClinicByCustomer(sub.customer as string, {
                    stripe_subscription_id: sub.id as string,
                    subscription_status: sub.status as string,
                    stripe_trial_end: sub.trial_end ? new Date((sub.trial_end as number) * 1000).toISOString() : null,
                })
                break
            }

            case 'customer.subscription.deleted': {
                const sub = event.data.object as Record<string, unknown>
                console.log('Canceling subscription for customer:', sub.customer)
                await updateClinicByCustomer(sub.customer as string, {
                    stripe_subscription_id: null,
                    subscription_status: 'canceled',
                })
                break
            }

            default:
                console.log('Ignoring event type:', event.type)
                break
        }

        console.log('Webhook processed successfully')
        return new Response(JSON.stringify({ received: true }), { status: 200 })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        console.error('Webhook error:', message)
        return new Response(JSON.stringify({ error: message }), { status: 500 })
    }
}

addEventListener('fetch', (event) => {
    event.respondWith(handle(event.request))
})
