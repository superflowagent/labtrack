import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getClinicForUser, updateClinic } from '@/services/supabase/clinic'
import { startCheckout, openBillingPortal, manageSubscription } from '@/services/billing'
import { formatDistanceToNowStrict } from 'date-fns'
import type { Clinic } from '@/types/domain'

export default function ClinicSettings() {
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    getClinicForUser()
      .then((c) => {
        if (!mounted) return
        setClinic(c)
        setName(c?.name ?? '')
      })
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  const saveName = async () => {
    setSaving(true)
    try {
      await updateClinic({ name })
      const refreshed = await getClinicForUser()
      setClinic(refreshed)
      window.clinicName = name
      window.dispatchEvent(new Event('clinicNameChanged'))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleStartCheckout = async () => {
    if (!clinic?.id) return
    try {
      const url = await startCheckout(clinic.id)
      window.location.href = url
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    }
  }

  const handleOpenPortal = async () => {
    if (!clinic?.stripe_customer_id) return setError('No hay cliente de Stripe asociado')
    try {
      const url = await openBillingPortal(clinic.stripe_customer_id)
      window.open(url, '_blank')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    }
  }

  const handleCancelReactivate = async (action: 'cancel' | 'reactivate') => {
    if (!clinic?.stripe_subscription_id) return setError('No hay suscripción activa')
    try {
      await manageSubscription(clinic.stripe_subscription_id, action)
      const refreshed = await getClinicForUser()
      setClinic(refreshed)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    }
  }

  const computeTrialText = () => {
    if (!clinic) return ''
    if (clinic.subscription_status === 'active') return 'Suscripción activa'
    if (clinic.subscription_status === 'trialing') {
      if (clinic.stripe_trial_end) {
        const t = new Date(clinic.stripe_trial_end)
        return `Prueba activa — ${formatDistanceToNowStrict(t, { addSuffix: true })}`
      }
      return 'En periodo de prueba'
    }
    if (clinic.subscription_status) return `Estado: ${clinic.subscription_status}`
    if (clinic.stripe_trial_end) {
      const t = new Date(clinic.stripe_trial_end)
      return `Prueba activa — ${formatDistanceToNowStrict(t, { addSuffix: true })}`
    }
    return 'Sin suscripción'
  }

  if (loading) return <div className="p-8">Cargando...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Ajustes de la clínica</h1>
      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      <Card className="p-6 max-w-2xl">
        <div className="mb-4">
          <Label className="mb-2">Nombre de la clínica</Label>
          <Input value={name} onChange={(e) => setName((e.target as HTMLInputElement).value)} />
        </div>

        <div className="mb-4">
          <Label className="mb-2">Estado de la suscripción</Label>
          <div className="text-sm text-slate-700">{computeTrialText()}</div>
        </div>

        <CardFooter className="flex gap-2 mt-6">
          <Button onClick={saveName} disabled={saving}>{saving ? 'Guardando...' : 'Guardar nombre'}</Button>
          <Button variant="secondary" onClick={handleStartCheckout}>Iniciar suscripción</Button>
          <Button variant="ghost" onClick={handleOpenPortal} disabled={!clinic?.stripe_customer_id}>Abrir Billing Portal</Button>
          {clinic?.stripe_subscription_id && clinic?.subscription_status !== 'canceled' && (
            <Button variant="destructive" onClick={() => handleCancelReactivate('cancel')}>Cancelar</Button>
          )}
          {clinic?.stripe_subscription_id && clinic?.subscription_status === 'canceled' && (
            <Button onClick={() => handleCancelReactivate('reactivate')}>Reactivar</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}