import { supabase } from './client'
import type { Job, Laboratory, NewJob, Specialist } from '@/types/domain'

export const getClinicIdForUser = async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('No authenticated user')

  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', data.user.id)
    .single()

  if (clinicError) throw clinicError
  return clinic.id as string
}

export const fetchJobs = async (clinicId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('order_date', { ascending: false })

  if (error) throw error
  return (data ?? []) as Job[]
}

export const fetchLaboratories = async (clinicId: string) => {
  const { data, error } = await supabase
    .from('laboratories')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as Laboratory[]
}

export const fetchSpecialists = async (clinicId: string) => {
  const { data, error } = await supabase
    .from('specialists')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as Specialist[]
}

export const createJob = async (job: NewJob) => {
  const { data, error } = await supabase.from('jobs').insert(job).select('*').single()
  if (error) throw error
  return data as Job
}

export const createLaboratory = async (payload: { name: string; phone?: string | null; email?: string | null }) => {
  const clinicId = await getClinicIdForUser()
  const { data, error } = await supabase
    .from('laboratories')
    .insert({ name: payload.name, phone: payload.phone ?? null, email: payload.email ?? null, clinic_id: clinicId })
    .select('*')
    .single()

  if (error) throw error
  return data as Laboratory
}

export const createSpecialist = async (payload: { name: string; specialty?: string | null; phone?: string | null; email?: string | null }) => {
  const clinicId = await getClinicIdForUser()
  const { data, error } = await supabase
    .from('specialists')
    .insert({ name: payload.name, specialty: payload.specialty ?? null, phone: payload.phone ?? null, email: payload.email ?? null, clinic_id: clinicId })
    .select('*')
    .single()

  if (error) throw error
  return data as Specialist
}
