import { supabase } from './client'
import type { Clinic } from '@/types/domain'

export const getClinicForUser = async (): Promise<Clinic> => {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!data.user) throw new Error('No authenticated user')

    const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .select('id, name, stripe_customer_id, stripe_subscription_id, subscription_status, price_id, subscription_current_period_end, stripe_trial_end, user_id')
        .eq('user_id', data.user.id)
        .single()

    if (clinicError) throw clinicError
    return clinic as Clinic
}

export const updateClinic = async (patch: { name?: string; price_id?: string | null }) => {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('No authenticated user')

  const updates: Partial<{ name: string; price_id: string | null }> = {}
  if (patch.name !== undefined) updates.name = patch.name
  if (patch.price_id !== undefined) updates.price_id = patch.price_id

  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .update(updates)
    .eq('user_id', data.user.id)
    .select('*')
    .single()

  if (clinicError) throw clinicError
  return clinic as Clinic
} 
