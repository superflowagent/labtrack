import { supabase } from './client'
import type { Clinic } from '@/types/domain'

export const getClinicForUser = async (): Promise<Clinic> => {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!data.user) throw new Error('No authenticated user')

    const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .select('id, name')
        .eq('user_id', data.user.id)
        .single()

    if (clinicError) throw clinicError
    return clinic as Clinic
}
