import { useEffect, useState } from 'react'
import { getCurrentActor } from '@/services/supabase/actor'
import type { AppActor } from '@/types/domain'

export const useCurrentActor = () => {
    const [actor, setActor] = useState<AppActor | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true

        const load = async () => {
            setLoading(true)
            setError(null)

            try {
                const resolvedActor = await getCurrentActor()
                if (!mounted) return
                setActor(resolvedActor)
            } catch (err) {
                if (!mounted) return
                setError(err instanceof Error ? err.message : 'No se pudo cargar el acceso')
            } finally {
                if (mounted) setLoading(false)
            }
        }

        void load()
        return () => {
            mounted = false
        }
    }, [])

    return { actor, loading, error }
}