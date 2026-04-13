import { supabase } from './client'
import { getJobElapsedDays } from '@/lib/jobStatusTimer'
import type { AppActor, AppNotification, Job } from '@/types/domain'

const TEN_DAY_THRESHOLD = 10

const isUniqueViolationError = (error: unknown) => {
    return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505'
}

type InsertTenDayNotificationResult = 'created' | 'exists'

const hasReachedTenDaysElapsed = (job: Job) => {
    if (!job.laboratory_id) return false
    if (job.status === 'Cerrado') return false
    if (job.ten_day_notification_sent_at) return false
    return getJobElapsedDays(job, new Date()) >= TEN_DAY_THRESHOLD
}

const markJobTenDayNotificationTriggered = async (jobId: string) => {
    const { error } = await supabase
        .from('jobs')
        .update({ ten_day_notification_sent_at: new Date().toISOString() })
        .eq('id', jobId)

    if (error) throw error
}

const insertTenDayNotification = async ({
    job,
    recipientRole,
    title,
    body,
    metadata,
}: {
    job: Job
    recipientRole: 'clinic' | 'laboratory'
    title: string
    body: string
    metadata: Record<string, unknown>
}) => {
    const { error } = await supabase.from('notifications').insert({
        clinic_id: job.clinic_id,
        laboratory_id: job.laboratory_id,
        job_id: job.id,
        recipient_role: recipientRole,
        type: 'job_elapsed_ten_days',
        title,
        body,
        metadata,
    })

    if (error) {
        if (isUniqueViolationError(error)) return 'exists'
        throw error
    }

    return 'created' as InsertTenDayNotificationResult
}

export const fetchNotificationsForActor = async (actor: AppActor) => {
    let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

    query = actor.role === 'clinic'
        ? query.eq('clinic_id', actor.clinic.id).eq('recipient_role', 'clinic')
        : query.eq('laboratory_id', actor.laboratory.id).eq('recipient_role', 'laboratory')

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as AppNotification[]
}

export const fetchUnreadNotificationCountForActor = async (actor: AppActor) => {
    let query = supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .is('read_at', null)

    query = actor.role === 'clinic'
        ? query.eq('clinic_id', actor.clinic.id).eq('recipient_role', 'clinic')
        : query.eq('laboratory_id', actor.laboratory.id).eq('recipient_role', 'laboratory')

    const { count, error } = await query
    if (error) throw error
    return count ?? 0
}

export const markNotificationAsRead = async (notificationId: string) => {
    const { data, error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .select('*')
        .single()

    if (error) throw error
    return data as AppNotification
}

export const deleteNotification = async (notificationId: string) => {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

    if (error) throw error
    window.dispatchEvent(new Event('notificationsChanged'))
}

export const createClinicNotificationForLabStatus = async (job: Job, laboratoryName: string) => {
    const { error } = await supabase.from('notifications').insert({
        clinic_id: job.clinic_id,
        laboratory_id: job.laboratory_id,
        job_id: job.id,
        recipient_role: 'clinic',
        type: 'job_sent_from_lab',
        title: 'Trabajo enviado',
        body: `${laboratoryName} ha marcado un trabajo como En envío.`,
        metadata: { jobId: job.id, status: job.status, laboratoryName },
    })

    if (error) throw error
    window.dispatchEvent(new Event('notificationsChanged'))
    return null
}

export const createLaboratoryNotificationForNewJob = async (job: Job, clinicName: string) => {
    if (!job.laboratory_id) return null

    const { data, error } = await supabase.from('notifications').insert({
        clinic_id: job.clinic_id,
        laboratory_id: job.laboratory_id,
        job_id: job.id,
        recipient_role: 'laboratory',
        type: 'job_created_for_lab',
        title: 'Nuevo trabajo asignado',
        body: `${clinicName} te ha asignado un nuevo trabajo.`,
        metadata: { jobId: job.id, status: job.status, clinicName },
    }).select('*').single()

    if (error) throw error
    window.dispatchEvent(new Event('notificationsChanged'))
    return data as AppNotification
}

export const syncTenDayJobNotifications = async ({
    jobs,
    clinicName,
    laboratoryNamesById,
}: {
    jobs: Job[]
    clinicName: string
    laboratoryNamesById: Record<string, string>
}) => {
    const dueJobs = jobs.filter(hasReachedTenDaysElapsed)
    if (dueJobs.length === 0) return 0

    let createdCount = 0

    for (const job of dueJobs) {
        if (!job.laboratory_id) continue

        const laboratoryName = laboratoryNamesById[job.laboratory_id]
        if (!laboratoryName) continue

        const clinicResult = await insertTenDayNotification({
            job,
            recipientRole: 'clinic',
            title: 'Trabajo retrasado',
            body: `${laboratoryName} tiene un trabajo que ha alcanzado 10 días transcurridos.`,
            metadata: { jobId: job.id, thresholdDays: TEN_DAY_THRESHOLD, laboratoryName },
        })

        if (clinicResult === 'created') {
            createdCount += 1
        }

        const laboratoryResult = await insertTenDayNotification({
            job,
            recipientRole: 'laboratory',
            title: 'Trabajo retrasado',
            body: `${clinicName} tiene un trabajo que ha alcanzado 10 días transcurridos.`,
            metadata: { jobId: job.id, thresholdDays: TEN_DAY_THRESHOLD, clinicName },
        })

        if (laboratoryResult === 'created') {
            createdCount += 1
        }

        if ((clinicResult === 'created' || clinicResult === 'exists') && (laboratoryResult === 'created' || laboratoryResult === 'exists')) {
            await markJobTenDayNotificationTriggered(job.id)
        }
    }

    if (createdCount > 0) {
        window.dispatchEvent(new Event('notificationsChanged'))
    }

    return createdCount
}