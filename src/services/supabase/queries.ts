import { supabase } from './client'
import { getClinicForUser } from './clinic'
import type { Job, Laboratory, NewJob, Patient, Specialist, Clinic } from '@/types/domain' 

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

const ensureActiveClinic = async () => {
  const clinic = await getClinicForUser()
  const now = new Date()
  const trialEnd = clinic?.stripe_trial_end ? new Date(clinic.stripe_trial_end) : null
  const isActive = clinic?.subscription_status === 'active' || clinic?.subscription_status === 'trialing' || (trialEnd && trialEnd > now)
  if (!isActive) throw new Error('Se requiere una suscripción activa o periodo de prueba para realizar esta acción.')
  return clinic as Clinic
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

export const fetchPatients = async (clinicId: string) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as Patient[]
}

export const createJob = async (job: NewJob) => {
  // job sólo debe tener patient_id, no patient_name ni patient_phone
  await ensureActiveClinic()
  const { data, error } = await supabase.from('jobs').insert(job).select('*').single()
  if (error) throw error
  return data as Job
} 

export const createLaboratory = async (payload: { name: string; phone?: string | null; email?: string | null }) => {
  const clinic = await ensureActiveClinic()
  const clinicId = clinic.id
  const { data, error } = await supabase
    .from('laboratories')
    .insert({ name: payload.name, phone: payload.phone ?? null, email: payload.email ?? null, clinic_id: clinicId })
    .select('*')
    .single()

  if (error) throw error
  return data as Laboratory
} 

export const createSpecialist = async (payload: { name: string; specialty?: string | null; phone?: string | null; email?: string | null }) => {
  const clinic = await ensureActiveClinic()
  const clinicId = clinic.id
  const { data, error } = await supabase
    .from('specialists')
    .insert({ name: payload.name, specialty: payload.specialty ?? null, phone: payload.phone ?? null, email: payload.email ?? null, clinic_id: clinicId })
    .select('*')
    .single()

  if (error) throw error
  return data as Specialist
} 

export const createPatient = async (payload: { name: string; phone?: string | null; email?: string | null; code?: string | null }) => {
  const clinic = await ensureActiveClinic()
  const clinicId = clinic.id
  const { data, error } = await supabase
    .from('patients')
    .insert({ name: payload.name, phone: payload.phone ?? null, email: payload.email ?? null, code: payload.code ?? null, clinic_id: clinicId })
    .select('*')
    .single()

  if (error) throw error
  return data as Patient
} 

export const updateJob = async (id: string, payload: Partial<NewJob>) => {
  await ensureActiveClinic()
  // payload sólo debe tener patient_id, no patient_name ni patient_phone
  const { data, error } = await supabase
    .from('jobs')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data as Job
} 

export const deleteJob = async (id: string) => {
  await ensureActiveClinic()
  const { data, error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data as Job
} 

export const updateLaboratory = async (id: string, payload: { name: string; phone?: string | null; email?: string | null }) => {
  const clinic = await ensureActiveClinic()
  const clinicId = clinic.id
  const { data, error } = await supabase
    .from('laboratories')
    .update({ name: payload.name, phone: payload.phone ?? null, email: payload.email ?? null })
    .eq('id', id)
    .eq('clinic_id', clinicId)
    .select('*')
    .single()

  if (error) throw error
  return data as Laboratory
} 

export const updateSpecialist = async (id: string, payload: { name: string; specialty?: string | null; phone?: string | null; email?: string | null }) => {
  const clinic = await ensureActiveClinic()
  const clinicId = clinic.id
  const { data, error } = await supabase
    .from('specialists')
    .update({ name: payload.name, specialty: payload.specialty ?? null, phone: payload.phone ?? null, email: payload.email ?? null })
    .eq('id', id)
    .eq('clinic_id', clinicId)
    .select('*')
    .single()

  if (error) throw error
  return data as Specialist
} 

export const updatePatient = async (id: string, payload: { name: string; phone?: string | null; email?: string | null; code?: string | null }) => {
  const clinic = await ensureActiveClinic()
  const clinicId = clinic.id
  const { data, error } = await supabase
    .from('patients')
    .update({ name: payload.name, phone: payload.phone ?? null, email: payload.email ?? null, code: payload.code ?? null })
    .eq('id', id)
    .eq('clinic_id', clinicId)
    .select('*')
    .single()

  if (error) throw error
  return data as Patient
} 

export const deleteLaboratory = async (id: string) => {
  const clinic = await ensureActiveClinic()
  const clinicId = clinic.id
  const { data, error } = await supabase
    .from('laboratories')
    .delete()
    .eq('id', id)
    .eq('clinic_id', clinicId)
    .select('*')
    .single()

  if (error) throw error
  return data as Laboratory
} 

export const deleteSpecialist = async (id: string) => {
  const clinic = await ensureActiveClinic()
  const clinicId = clinic.id
  const { data, error } = await supabase
    .from('specialists')
    .delete()
    .eq('id', id)
    .eq('clinic_id', clinicId)
    .select('*')
    .single()

  if (error) throw error
  return data as Specialist
} 

export const deletePatient = async (id: string) => {
  const clinic = await ensureActiveClinic()
  const clinicId = clinic.id
  const { data, error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id)
    .eq('clinic_id', clinicId)
    .select('*')
    .single()

  if (error) throw error
  return data as Patient
} 
