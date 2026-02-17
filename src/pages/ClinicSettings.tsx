import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/services/supabase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { getClinicForUser, updateClinic } from '@/services/supabase/clinic'
import type { Clinic } from '@/types/domain'
import { Button } from '@/components/ui/button'

export default function ClinicSettings({ asCard = false }: { asCard?: boolean } = {}) {
    const [clinic, setClinic] = useState<Clinic | null>(null)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [name, setName] = useState('')
    const [nameSaving, setNameSaving] = useState(false)
    const [nameSaveStatus, setNameSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
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
        const trialEnd = new Date(clinic.trial_ends_at)
        if (clinic.is_premium) {
            subscriptionStatus = 'premium'
        } else if (now < trialEnd) {
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
                                {subscriptionStatus === 'premium' && (
                                    <span className="text-green-700">Premium activa</span>
                                )}
                                {subscriptionStatus === 'trial' && (
                                    <span className="text-yellow-700">Prueba activa ({trialDaysLeft} días restantes)</span>
                                )}
                                {subscriptionStatus === 'none' && (
                                    <span className="text-red-700">Sin suscripción activa</span>
                                )}
                                <Button
                                    variant="outline"
                                    className="w-fit"
                                    onClick={async () => {
                                        if (!clinic) return
                                        // Si no es premium, ir al payment link
                                        if (subscriptionStatus !== 'premium') {
                                            const paymentLink = process.env.NODE_ENV === 'production'
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
                                        // Si es premium, ir al portal de cliente
                                        const res = await fetch('/api/portal', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ clinicId: clinic.id }),
                                        })
                                        const data = await res.json()
                                        if (data.url) window.location.href = data.url
                                    }}
                                >
                                    Gestionar suscripción
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </Card>
        </div>
    )
}