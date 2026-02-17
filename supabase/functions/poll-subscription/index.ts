import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

    try {
        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

        if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
            return new Response(JSON.stringify({ error: 'Missing env vars' }), { status: 500, headers: corsHeaders })
        }

        // Verify JWT manually by creating a client with the auth header
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401, headers: corsHeaders })
        }

        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: { headers: { Authorization: authHeader } },
        })

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
        }

        const { clinic_id } = await req.json()
        if (!clinic_id) {
            return new Response(JSON.stringify({ error: 'Missing clinic_id' }), { status: 400, headers: corsHeaders })
        }

        // Get clinic data including user_id to verify ownership
        const clinicRes = await fetch(
            `${SUPABASE_URL}/rest/v1/clinics?id=eq.${clinic_id}&select=stripe_customer_id,user_id,manual_premium`,
            {
                headers: {
                    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        )

        if (!clinicRes.ok) {
            return new Response(JSON.stringify({ error: 'Clinic not found' }), { status: 404, headers: corsHeaders })
        }

        const clinics = await clinicRes.json()
        const clinic = clinics[0]

        if (!clinic) {
            return new Response(JSON.stringify({ error: 'Clinic not found' }), { status: 404, headers: corsHeaders })
        }

        // Security: Verify that the clinic belongs to the authenticated user
        if (clinic.user_id !== user.id) {
            return new Response(JSON.stringify({ error: 'Forbidden: clinic does not belong to user' }), { status: 403, headers: corsHeaders })
        }
        if (clinic?.manual_premium) {
            return new Response(JSON.stringify({ synced: true, status: 'manual', message: 'Manual premium enabled' }), { status: 200, headers: corsHeaders })
        }

        let stripeCustId = clinic?.stripe_customer_id

        // If no stripe_customer_id, look up by user email
        if (!stripeCustId && clinic?.user_id) {
            const userRes = await fetch(`${SUPABASE_URL}/rest/v1/auth.users?id=eq.${clinic.user_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (userRes.ok) {
                const users = await userRes.json()
                const user = users[0]

                if (user?.email) {
                    // Search Stripe customers by email
                    const customersRes = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(user.email)}&limit=1`,
                        {
                            headers: {
                                Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
                            },
                        }
                    )

                    if (customersRes.ok) {
                        const { data: customers } = await customersRes.json()
                        if (customers?.[0]?.id) {
                            stripeCustId = customers[0].id
                            // Save stripe_customer_id for future use
                            await fetch(`${SUPABASE_URL}/rest/v1/clinics?id=eq.${clinic_id}`,
                                {
                                    method: 'PATCH',
                                    headers: {
                                        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ stripe_customer_id: stripeCustId }),
                                }
                            )
                        }
                    }
                }
            }
        }

        if (!stripeCustId) {
            return new Response(JSON.stringify({ synced: false, message: 'No stripe customer found' }), { status: 200, headers: corsHeaders })
        }

        // Query Stripe for active subscriptions
        const subsRes = await fetch(
            `https://api.stripe.com/v1/customers/${stripeCustId}/subscriptions?limit=1&status=active`,
            {
                headers: {
                    Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
                },
            }
        )

        if (!subsRes.ok) {
            return new Response(JSON.stringify({ error: 'Stripe query failed' }), { status: subsRes.status, headers: corsHeaders })
        }

        const { data: subs } = await subsRes.json()
        const activeSub = subs?.[0]

        if (!activeSub) {
            return new Response(JSON.stringify({ synced: false, message: 'No active subscription' }), { status: 200, headers: corsHeaders })
        }

        // Update clinic with active subscription
        const updateRes = await fetch(
            `${SUPABASE_URL}/rest/v1/clinics?id=eq.${clinic_id}`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stripe_customer_id: stripeCustId,
                    stripe_subscription_id: activeSub.id,
                    subscription_status: activeSub.status,
                    stripe_trial_end: activeSub.trial_end ? new Date(activeSub.trial_end * 1000).toISOString() : null,
                }),
            }
        )

        if (!updateRes.ok) {
            console.error('Failed to update clinic:', await updateRes.text())
            return new Response(JSON.stringify({ error: 'Failed to update clinic' }), { status: 500, headers: corsHeaders })
        }

        return new Response(JSON.stringify({ synced: true, subscription_id: activeSub.id, status: activeSub.status }), { status: 200, headers: corsHeaders })
    } catch (err) {
        console.error('Error:', err)
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders })
    }
})
