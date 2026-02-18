import { useState, useEffect, useCallback } from 'react'
import { getClinicForUser, updateClinic } from '@/services/supabase/clinic'
import type { Clinic } from '@/types/domain'
import { supabase } from '@/services/supabase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'


export default function ClinicSettings({ asCard = false }: { asCard?: boolean } = {}) {
    const [clinic, setClinic] = useState<Clinic | null>(null)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [name, setName] = useState('')
    const [nameSaving, setNameSaving] = useState(false)
    const [nameSaveStatus, setNameSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const [portalLoading, setPortalLoading] = useState(false)
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
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user?.email) setUserEmail(data.user.email)
        })
        return () => { mounted = false }
    }, [])

    const saveName = useCallback(async (opts?: { force?: boolean }) => {
        if (!clinic) return
        if (!opts?.force && name === clinic.name) {
            setNameSaveStatus('saved')
            return
        }

        const prevName = clinic.name
        // optimistic update
        setClinic({ ...clinic, name })
        setNameSaveStatus('saving')
        setNameSaving(true)
        try {
            const updated = await updateClinic({ name })
            setClinic(updated)
            window.clinicName = name
            window.dispatchEvent(new Event('clinicNameChanged'))
            setNameSaveStatus('saved')
            // show "guardado" briefly
            setTimeout(() => setNameSaveStatus('idle'), 2000)
        } catch (err: unknown) {
            // rollback on error
            setClinic({ ...clinic, name: prevName })
            const msg = err instanceof Error ? err.message : String(err)
            setError(msg)
            setNameSaveStatus('error')
        } finally {
            setNameSaving(false)
        }
    }, [clinic, name])

    // Eliminado: handleStartCheckout y lógica de Stripe

    // Eliminado: now
    // Eliminado: trialEnd, trialDaysLeft, isTrialActive, isActive

    // autosave: debounce + flush on blur
    useEffect(() => {
        if (!clinic) return
        if (name === clinic.name) {
            setNameSaveStatus('saved')
            return
        }
        setNameSaveStatus('idle')
        const t = setTimeout(() => {
            saveName()
        }, 800)
        return () => clearTimeout(t)
    }, [name, clinic, saveName])

    if (loading) return asCard ? <div className="p-0">Cargando...</div> : <div className="p-8">Cargando...</div>

    // Lógica de suscripción
    let subscriptionStatus: 'trial' | 'premium' | 'none' = 'none'
    let trialDaysLeft = 0
    if (clinic) {
        const now = new Date()
        const trialEnd = clinic.trial_ends_at ? new Date(clinic.trial_ends_at) : null
        if (clinic.is_premium) {
            subscriptionStatus = 'premium'
        } else if (trialEnd && now < trialEnd) {
            subscriptionStatus = 'trial'
            trialDaysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        }
    }

    return (
        <div className={asCard ? 'p-0' : 'p-8'}>
            <Card className="border-slate-200 bg-white/80 p-5">
                {asCard && (
                    <CardHeader>
                        <CardTitle>Ajustes de la clínica</CardTitle>
                    </CardHeader>
                )}
                {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
                <div className="max-w-2xl space-y-6">
                    {/* Clinic info (nombre) */}
                    <Card className="p-6 mb-6">
                        <div className="mb-4">
                            <Label className="mb-2">Nombre de la clínica</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    value={name}
                                    onChange={(e) => setName((e.target as HTMLInputElement).value)}
                                    onBlur={() => saveName({ force: true })}
                                    disabled={nameSaving}
                                />
                                <div className="text-sm min-w-[88px]">
                                    {nameSaveStatus === 'saving' && <span className="text-slate-600">Guardando…</span>}
                                    {nameSaveStatus === 'saved' && <span className="text-green-600">Guardado</span>}
                                    {nameSaveStatus === 'error' && <span className="text-red-600">Error al guardar</span>}
                                </div>
                            </div>
                        </div>
                    </Card>
                    {/* Subscription card */}
                    <Card className="p-6">
                        <div className="mb-4">
                            <Label className="mb-2">Suscripción</Label>
                            <div className="flex flex-col gap-2">
                                <span
                                    className={
                                        subscriptionStatus === 'premium'
                                            ? 'self-start w-auto my-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700'
                                            : subscriptionStatus === 'trial'
                                                ? 'self-start w-auto my-2 inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700'
                                                : 'self-start w-auto my-2 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700'
                                    }
                                >
                                    {subscriptionStatus === 'premium' && `⭐ Suscripción activa`}
                                    {subscriptionStatus === 'trial' && `⏳ Prueba gratuita (${trialDaysLeft} días restantes)`}
                                    {subscriptionStatus === 'none' && `🚫 Sin suscripción`}
                                </span>
                                <Button
                                    variant="outline"
                                    className="w-fit"
                                    disabled={portalLoading}
                                    onClick={async () => {
                                        if (!clinic) return

                                        // Si no es premium, ir al payment link
                                        if (subscriptionStatus !== 'premium') {
                                            const paymentLink = import.meta.env.MODE === 'production'
                                                ? 'https://buy.stripe.com/dRm8wJ1fH9cCe7j72x4Vy01'
                                                : 'https://buy.stripe.com/test_8x25kx8Xb5HugTSdyJ1oI08'
                                            const params = new URLSearchParams({
                                                client_reference_id: clinic.id,
                                                ...(userEmail ? { 'prefilled_email': userEmail } : {})
                                            })
                                            const url = `${paymentLink}?${params.toString()}`
                                            window.location.href = url
                                            return
                                        }

                                        // premium -> open Stripe Customer Portal (server-side)
                                        setPortalLoading(true)
                                        try {
                                            const { data: { session } } = await supabase.auth.getSession()
                                            const token = session?.access_token

                                            const endpoint = '/api/portal' // dev proxy forwards to test-server
                                            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
                                            if (token) headers['Authorization'] = `Bearer ${token}`

                                            const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify({ clinicId: clinic.id }) })

                                            if (!res.ok) {
                                                let errBody: unknown = null
                                                try { errBody = await res.json() } catch { /* ignore non-json */ }
                                                const errMsg = typeof errBody === 'object' && errBody !== null && 'error' in (errBody as Record<string, unknown>)
                                                    ? ((errBody as Record<string, unknown>)['error'] as string | undefined)
                                                    : undefined
                                                throw new Error(errMsg || res.statusText || 'No se pudo abrir el portal')
                                            }

                                            const data = await res.json()
                                            if (data?.url) window.location.href = data.url
                                        } catch (err: unknown) {
                                            const msg = err instanceof Error ? err.message : String(err)
                                            setError(msg)
                                        } finally {
                                            setPortalLoading(false)
                                        }
                                    }}
                                >
                                    {portalLoading ? 'Abriendo…' : 'Gestionar suscripción'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </Card>
        </div>
    )
}