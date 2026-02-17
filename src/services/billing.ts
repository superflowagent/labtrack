import { supabase } from '@/services/supabase/client'

// Stripe Payment Link - pre-created in Stripe Dashboard
// Configured via VITE_STRIPE_PAYMENT_LINK_URL env var
const PAYMENT_LINK_URL = import.meta.env.VITE_STRIPE_PAYMENT_LINK_URL

if (!PAYMENT_LINK_URL) {
    throw new Error('Missing VITE_STRIPE_PAYMENT_LINK_URL environment variable')
}

export async function openPaymentLink(clinicId: string, userEmail?: string) {
    const url = new URL(PAYMENT_LINK_URL)
    url.searchParams.set('client_reference_id', clinicId)

    // If email provided, pre-fill it in the Payment Link
    // This ensures Stripe creates customer with the correct email
    if (userEmail) {
        url.searchParams.set('prefilled_email', userEmail)
    }

    window.location.href = url.toString()
}

export async function openBillingPortal(clinicId: string, returnUrl?: string) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

    if (isLocal) {
        // Local: use webhook-server (avoids Edge Runtime JWT issues)
        const response = await fetch(`http://localhost:3001/create-portal-session/${clinicId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ return_url: returnUrl || window.location.href }),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to create portal session' }))
            throw new Error(error.error || 'No se pudo abrir el portal de Stripe')
        }

        const data = await response.json()
        const url = data?.url
        if (!url) throw new Error('No se pudo abrir el portal de Stripe')

        window.location.href = url
    } else {
        // Production: use Edge Function
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token

        if (!token) {
            throw new Error('Sesión expirada. Inicia sesión de nuevo.')
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                clinic_id: clinicId,
                return_url: returnUrl || window.location.href,
            }),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to create portal session' }))
            throw new Error(error.error || 'No se pudo abrir el portal de Stripe')
        }

        const data = await response.json()
        const url = data?.url
        if (!url) throw new Error('No se pudo abrir el portal de Stripe')

        window.location.href = url
    }
}