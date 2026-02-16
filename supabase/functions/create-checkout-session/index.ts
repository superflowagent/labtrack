// @ts-nocheck
import Stripe from 'stripe'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:5173'

if (!STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY')
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing Supabase envs')

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })

async function fetchClinic(clinicId: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/clinics?id=eq.${clinicId}&select=*`, {
    headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
  })
  const data = await res.json()
  return (data && data[0]) || null
}

async function findPriceIdForProduct(productId: string) {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 5 })
  return prices.data[0]?.id || null
}

addEventListener('fetch', (event) => {
  event.respondWith(handle(event.request))
})

async function handle(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  try {
    const body = await req.json()
    const { clinic_id } = body
    if (!clinic_id) return new Response(JSON.stringify({ error: 'clinic_id required' }), { status: 400 })

    const clinic = await fetchClinic(clinic_id)

    let customerId = clinic?.stripe_customer_id ?? null
    // if no customer, create without email (profiles table has email but we keep simple)
    if (!customerId) {
      const customer = await stripe.customers.create({ metadata: { clinic_id } })
      customerId = customer.id
      // persist customer id in clinics
      await fetch(`${SUPABASE_URL}/rest/v1/clinics?id=eq.${clinic_id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ stripe_customer_id: customerId }),
      })
    }

    // determine price
    let priceId = clinic?.price_id
    if (!priceId && body.product_id) {
      priceId = await findPriceIdForProduct(body.product_id)
    }

    if (!priceId) {
      // fallback: try to read from environment
      priceId = Deno.env.get('STRIPE_PRICE_ID') || null
    }

    if (!priceId) return new Response(JSON.stringify({ error: 'price_id not configured' }), { status: 400 })

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/dashboard`,
      metadata: { clinic_id },
    })

    return new Response(JSON.stringify({ url: session.url }), { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
} 
