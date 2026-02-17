import { supabase } from './client'

/**
 * Poll Stripe to check if the clinic has an active subscription
 * and sync it to the database
 */
export async function pollAndSyncSubscription(clinicId: string) {
    try {
        // In local development, use the local webhook server for polling
        // In production, use the Edge Function
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

        if (isLocal) {
            // Use local webhook server (faster, no JWT issues)
            const response = await fetch(`http://localhost:3001/poll/${clinicId}`, {
                method: 'POST',
        // Eliminado: toda la lógica de polling/sync Stripe
        return null
            if (!response.ok) {
                console.warn('Local polling failed, trying Edge Function...')
                return fallbackEdgeFunctionPolling(clinicId)
            }

            const data = await response.json()
// Archivo eliminado: ya no se usa ningún polling ni función relacionada con Stripe.
                    subscription_id: data.subscription_id,
                    status: data.status,
                }
            }

            console.log('ℹ️ No subscription found yet:', data?.message)
            return null
        } else {
            // Use Edge Function for production
            return fallbackEdgeFunctionPolling(clinicId)
        }
    } catch (err) {
        console.error('Error polling subscription:', err)
        return null
    }
}

async function fallbackEdgeFunctionPolling(clinicId: string) {
    try {
        const { data, error } = await supabase.functions.invoke('poll-subscription', {
            body: { clinic_id: clinicId },
        })

        if (error) {
            console.error('Subscription sync error:', error)
            return null
        }

        if (data?.synced) {
            console.log('✅ Subscription synced:', data.subscription_id)
            return {
                subscription_id: data.subscription_id,
                status: data.status,
            }
        }

        return null
    } catch (err) {
        console.error('Error with Edge Function polling:', err)
        return null
    }
}
