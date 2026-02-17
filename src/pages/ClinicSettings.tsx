import { useCallback, useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getClinicForUser, updateClinic } from '@/services/supabase/clinic'
import type { Clinic } from '@/types/domain'

export default function ClinicSettings({ asCard = false }: { asCard?: boolean } = {}) {
    const [clinic, setClinic] = useState<Clinic | null>(null)
    // Eliminado: lógica de email y Stripe
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
                </div>
            </Card>
        </div>
    )
}