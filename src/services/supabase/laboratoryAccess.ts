import { supabase } from './client'
import type { LaboratoryUser } from '@/types/domain'

const getLaboratoryAccessEndpoint = () => {
    if (import.meta.env.DEV && typeof window !== 'undefined') {
        const hostname = window.location.hostname || 'localhost'
        return `http://${hostname}:3001/api/laboratory-access`
    }

    return '/api/laboratory-access'
}

const getAuthHeaders = async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    const token = data.session?.access_token
    if (!token) throw new Error('No authenticated session')

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }
}

const parseJson = async <T>(response: Response) => {
    const payload = await response.json().catch(() => null) as T | { error?: string } | null
    if (!response.ok) {
        const message = payload && typeof payload === 'object' && 'error' in payload && payload.error
            ? payload.error
            : 'No se pudo procesar la solicitud'
        throw new Error(message)
    }
    return payload as T
}

const requestLaboratoryAccess = async <T>(method: 'POST' | 'PATCH', body: Record<string, unknown>) => {
    const headers = await getAuthHeaders()
    const primaryEndpoint = '/api/laboratory-access'
    const fallbackEndpoint = getLaboratoryAccessEndpoint()

    const attempt = async (endpoint: string) => fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(body),
    })

    let response = await attempt(primaryEndpoint)

    if (import.meta.env.DEV && response.status === 404 && fallbackEndpoint !== primaryEndpoint) {
        response = await attempt(fallbackEndpoint)
    }

    return parseJson<T>(response)
}

export const createLaboratoryAccess = async (laboratoryId: string, email: string, password: string) => {
    return requestLaboratoryAccess<{ access: LaboratoryUser }>('POST', { laboratoryId, email, password })
}

export const setLaboratoryAccessActive = async (laboratoryId: string, isActive: boolean) => {
    return requestLaboratoryAccess<{ access: LaboratoryUser }>('PATCH', { laboratoryId, isActive })
}