import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getClinicForUser, updateClinic } from '@/services/supabase/clinic'
import { openBillingPortal, openPaymentLink } from '@/services/billing'
import { supabase } from '@/services/supabase/client'
import { formatDistanceToNowStrict, differenceInCalendarDays } from 'date-fns'
import type { Clinic } from '@/types/domain'

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

        // Get user email
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (mounted && user) {
                setUserEmail(user.email || null)
            }
        }).catch(console.error)

        // Get clinic data
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

    const handleStartCheckout = async () => {
        if (!clinic?.id) {
            setError('No hay clínica asociada para activar la suscripción')
            return
        }

        if (clinic.manual_premium) {
            setError('Suscripción manual activa. No hay portal de Stripe para gestionarla.')
            return
        }

        try {
            if (isActive) {
                await openBillingPortal(clinic.id)
                return
            }

            await openPaymentLink(clinic.id, userEmail || undefined)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            setError(msg)
        }
    }

    const now = new Date()
    const trialEnd = clinic?.stripe_trial_end ? new Date(clinic.stripe_trial_end) : null
    const trialDaysLeft = trialEnd ? differenceInCalendarDays(trialEnd, now) : null
    const isTrialActive = !!trialEnd && trialEnd > now
    const isActive = !!clinic?.manual_premium || clinic?.subscription_status === 'active'

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
                    <Card className="p-6">
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

                    {/* Subscription controls */}
                    <Card className="p-6">
                        <div className="mb-4">
                            <Label className="mb-2">Estado de la suscripción</Label>
                        </div>

                        {isActive && (
                            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                                Suscripción activa
                            </div>
                        )}

                        {!isActive && isTrialActive && (
                            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        Te quedan {trialDaysLeft !== null ? `${Math.max(trialDaysLeft, 0)} días` : formatDistanceToNowStrict(trialEnd!, { addSuffix: true })} de prueba gratis.
                                    </div>
                                    <Button variant="secondary" onClick={handleStartCheckout}>Gestionar suscripción</Button>
                                </div>
                            </div>
                        )}

                        {!isActive && !isTrialActive && (
                            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                                El periodo de prueba ha finalizado. Activa una suscripción para seguir usando Labtrack.
                            </div>
                        )}

                        {!isTrialActive && (
                            <div className="mt-6 flex w-full flex-wrap items-start justify-start gap-2">
                                <Button variant="secondary" onClick={handleStartCheckout}>Gestionar suscripción</Button>
                            </div>
                        )}
                    </Card>
                </div>
            </Card>
        </div>
    )
}