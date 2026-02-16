/*
  Script: retroactive-create-subscriptions.js
  - Creates Stripe Customer + Subscription for clinics without stripe_subscription_id
  - Uses STRIPE_SECRET_KEY, VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from env
  - Dry-run supported: node scripts/retroactive-create-subscriptions.js --dry-run
*/

const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')

const argv = require('minimist')(process.argv.slice(2))
const DRY = !!argv['dry-run']

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const PRODUCT_ID = process.env.STRIPE_PRODUCT_ID || process.env.STRIPE_PRODUCT || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase envs')
  process.exit(1)
}
if (!STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY')
  process.exit(1)
}
if (!PRODUCT_ID) {
  console.error('Missing STRIPE_PRODUCT_ID (set STRIPE_PRODUCT_ID env)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const stripe = Stripe(STRIPE_SECRET_KEY)

async function findPriceForProduct(productId) {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 10 })
  return prices.data[0]
}

async function run() {
  const price = await findPriceForProduct(PRODUCT_ID)
  if (!price) {
    console.error('No price found for product', PRODUCT_ID)
    process.exit(1)
  }
  console.log('Using price:', price.id)

  const { data: clinics } = await supabase.from('clinics').select('*').is('stripe_subscription_id', null).limit(500)
  console.log(`Found ${clinics.length} clinics without subscription (processing up to 500)`)

  for (const clinic of clinics) {
    console.log('- Clinic', clinic.id, clinic.name)
    if (DRY) {
      console.log('  DRY RUN: would create customer+subscription for clinic', clinic.id)
      continue
    }

    // find owner email from profiles
    const { data: profiles } = await supabase.from('profiles').select('email').eq('user_id', clinic.user_id).limit(1)
    const ownerEmail = profiles?.[0]?.email || undefined

    // create customer
    const customer = await stripe.customers.create({
      email: ownerEmail,
      metadata: { clinic_id: clinic.id }
    })
    console.log('  created customer', customer.id)

    // create subscription (Stripe will apply the price trial configured)
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      expand: ['latest_invoice.payment_intent']
    })
    console.log('  created subscription', subscription.id, 'status', subscription.status)

    // update clinic row
    const { error } = await supabase.from('clinics').update({
      stripe_customer_id: customer.id,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      price_id: price.id,
      subscription_current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      stripe_trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    }).eq('id', clinic.id)

    if (error) {
      console.error('  supabase update failed for clinic', clinic.id, error.message)
    } else {
      console.log('  clinic updated')
    }
  }
}

run().catch((err) => { console.error(err); process.exit(1) })
