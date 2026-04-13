export type Laboratory = {
  id: string
  name: string
  phone: string | null
  email: string | null
  clinic_id: string
}

export type LaboratoryUser = {
  id: string
  clinic_id: string
  laboratory_id: string
  user_id: string
  email: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Clinic = {
  id: string
  name: string
  is_premium: boolean
  trial_ends_at?: string | null
  user_id?: string
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
  lastname: string | null
  dni: string | null
  phone: string | null
  email: string | null
  code: string | null
  clinic_id: string
}

export type AppRole = 'clinic' | 'laboratory'

export type JobStatus =
  | 'En laboratorio'
  | 'En envío'
  | 'En clínica (sin citar)'
  | 'En clínica (citado)'
  | 'Cerrado'

export type Job = {
  id: string
  patient_id: string | null
  job_description: string | null
  laboratory_id: string | null
  specialist_id: string | null
  order_date: string | null
  created_at: string
  ten_day_notification_sent_at: string | null
  status_timer_started_at: string | null
  status_timer_stopped_at: string | null
  status: JobStatus
  shared_notes: string | null
  clinic_last_viewed_comment_at: string | null
  laboratory_last_viewed_comment_at: string | null
  last_comment_at: string | null
  last_comment_by_role: AppRole | null
  clinic_id: string
}

export type JobCommentKind = 'comment' | 'status_change'

export type NewJob = Omit<Job, 'id' | 'created_at' | 'ten_day_notification_sent_at' | 'status_timer_started_at' | 'status_timer_stopped_at'> & {
  ten_day_notification_sent_at?: string | null
}

export type JobComment = {
  id: string
  job_id: string
  clinic_id: string
  laboratory_id: string
  sender_role: AppRole
  body: string
  comment_kind: JobCommentKind
  actor_display_name: string | null
  previous_status: JobStatus | null
  next_status: JobStatus | null
  previous_status_elapsed_seconds: number | null
  created_at: string
}

export type NotificationRecipientRole = 'clinic' | 'laboratory'

export type NotificationType = 'job_created_for_lab' | 'job_sent_from_lab' | 'job_elapsed_ten_days'

export type AppNotification = {
  id: string
  clinic_id: string
  laboratory_id: string | null
  job_id: string | null
  recipient_role: NotificationRecipientRole
  type: NotificationType
  title: string
  body: string
  metadata: Record<string, unknown>
  read_at: string | null
  created_at: string
}

export type ClinicActor = {
  role: 'clinic'
  clinic: Clinic
  displayName: string
}

export type LaboratoryActor = {
  role: 'laboratory'
  clinic: Pick<Clinic, 'id' | 'name'>
  laboratory: Laboratory
  access: LaboratoryUser
  displayName: string
}

export type AppActor = ClinicActor | LaboratoryActor
