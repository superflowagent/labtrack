export async function startCheckout(clinicId: string) {
  const res = await fetch('/functions/v1/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clinic_id: clinicId }),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.message || 'No se pudo crear la sesión de pago')
  return payload.url as string
}

export async function openBillingPortal(customerId: string) {
  const res = await fetch('/functions/v1/billing-portal-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_id: customerId }),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.message || 'No se pudo abrir el portal de facturación')
  return payload.url as string
}

export async function manageSubscription(subscriptionId: string, action: 'cancel' | 'reactivate') {
  const res = await fetch('/functions/v1/manage-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription_id: subscriptionId, action }),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.message || 'Error gestionando la suscripción')
  return payload
}