export type JobStatus =
  | 'En laboratorio'
  | 'En clinica (sin citar)'
  | 'En clinica (citado)'
  | 'Cerrado'

export type Laboratory = {
  id: string
  name: string
  phone: string | null
  email: string | null
  clinic_id: string
}

export type Clinic = {
  id: string
  name: string
}

export type Specialist = {
  id: string
  name: string
  specialty: string | null
  phone: string | null
  email: string | null
  clinic_id: string
}

export type Patient = {
  id: string
  name: string
  phone: string | null
  email: string | null
  code: string | null
  clinic_id: string
}

export type Job = {
  id: string
  patient_name: string
  patient_phone: string | null
  patient_id: string | null
  job_description: string | null
  laboratory_id: string | null
  specialist_id: string | null
  order_date: string | null
  status: JobStatus
  clinic_id: string
}

export type NewJob = Omit<Job, 'id'>
