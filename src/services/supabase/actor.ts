import { supabase } from './client'
import type { AppActor, Clinic, Laboratory, LaboratoryUser } from '@/types/domain'

type LaboratoryActorRow = LaboratoryUser & {
    laboratory: Laboratory | Laboratory[] | null
    clinic: Pick<Clinic, 'id' | 'name'> | Array<Pick<Clinic, 'id' | 'name'>> | null
}

const getSingleRelation = <T>(value: T | T[] | null | undefined) => {
    if (!value) return null
    return Array.isArray(value) ? (value[0] ?? null) : value
}

export const getLaboratoryAccessForUser = async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!data.user) throw new Error('No authenticated user')

    const { data: access, error: accessError } = await supabase
        .from('laboratory_users')
        .select('id, clinic_id, laboratory_id, user_id, email, is_active, created_at, updated_at, laboratory:laboratories(*), clinic:clinics(id, name)')
        .eq('user_id', data.user.id)
        .maybeSingle()

    if (accessError) throw accessError
    if (!access) return null

    const row = access as unknown as LaboratoryActorRow
    const laboratory = getSingleRelation(row.laboratory)
    const clinic = getSingleRelation(row.clinic)

    if (!laboratory || !clinic) {
        throw new Error('El acceso ha sido revocado')
    }

    return {
        access: {
            id: row.id,
            clinic_id: row.clinic_id,
            laboratory_id: row.laboratory_id,
            user_id: row.user_id,
            email: row.email,
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at,
        } satisfies LaboratoryUser,
        laboratory,
        clinic,
    }
}

export const getCurrentActor = async (): Promise<AppActor> => {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!data.user) throw new Error('No authenticated user')

    const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .select('id, name, is_premium, trial_ends_at, user_id')
        .eq('user_id', data.user.id)
        .maybeSingle()

    if (clinicError) throw clinicError
    if (clinic) {
        return {
            role: 'clinic',
            clinic: clinic as Clinic,
            displayName: (clinic as Clinic).name,
        }
    }

    const laboratoryAccess = await getLaboratoryAccessForUser()
    if (!laboratoryAccess) {
        throw new Error('No tienes acceso a ninguna clínica o laboratorio')
    }

    if (!laboratoryAccess.access.is_active) {
        throw new Error('Tu acceso al laboratorio está revocado')
    }

    return {
        role: 'laboratory',
        clinic: laboratoryAccess.clinic,
        laboratory: laboratoryAccess.laboratory,
        access: laboratoryAccess.access,
        displayName: laboratoryAccess.laboratory.name,
    }
}