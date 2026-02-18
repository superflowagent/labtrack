import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-01-28.clover' })
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const clinicId = body?.clinicId
        if (!clinicId) return NextResponse.json({ error: 'clinicId is required' }, { status: 400 })

        // require an authenticated user (access token sent from client)
        const authHeader = req.headers.get('authorization') || ''
        const token = authHeader.replace(/^Bearer\s+/i, '')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // validate token and get user id from Supabase auth endpoint
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
        const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
        })
        if (!userRes.ok) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
        const userJson = await userRes.json()
        const userId = userJson?.id
        if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

        // fetch clinic (server-side) to obtain stripe_customer_id + ownership
        const clinicRes = await fetch(`${SUPABASE_URL}/rest/v1/clinics?id=eq.${clinicId}&select=stripe_customer_id,is_premium,user_id`, {
            headers: {
                apikey: SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
        })
        if (!clinicRes.ok) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
        const clinics = await clinicRes.json()
        const clinic = Array.isArray(clinics) ? clinics[0] : clinics
        if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
        if (clinic.user_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        if (!clinic.is_premium) return NextResponse.json({ error: 'Clinic is not premium' }, { status: 400 })
        if (!clinic.stripe_customer_id) return NextResponse.json({ error: 'No stripe customer id for clinic' }, { status: 400 })

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_APP_URL || req.headers.get('origin') || 'https://app'
        const returnUrl = String(appUrl).replace(/\/$/, '') + '/dashboard'
        try {
            const session = await stripe.billingPortal.sessions.create({
                customer: clinic.stripe_customer_id,
                return_url: returnUrl,
            })
            return NextResponse.json({ url: session.url })
        } catch (err: any) {
            console.error('Stripe error creating portal session:', err)
            if (err?.code === 'resource_missing') return NextResponse.json({ error: 'Stripe customer not found' }, { status: 400 })
            return NextResponse.json({ error: 'Stripe error' }, { status: 500 })
        }
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'internal server error' }, { status: 500 })
    }
}

