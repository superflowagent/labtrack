import { supabase } from './client'
import type { Clinic } from '@/types/domain'

export const getClinicForUser = async (): Promise<Clinic> => {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('No authenticated user')

  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .select('id, name, is_premium, trial_ends_at, user_id')
    .eq('user_id', data.user.id)
    .single()

  if (clinicError) throw clinicError
  return clinic as Clinic
}

export const updateClinic = async (patch: { name?: string }) => {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('No authenticated user')

  const updates: Partial<{ name: string }> = {}
  if (patch.name !== undefined) updates.name = patch.name

  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .update(updates)
    .eq('user_id', data.user.id)
    .select('*')
    .single()

  if (clinicError) throw clinicError
  return clinic as Clinic
} 
