import { differenceInCalendarDays, formatDistance, formatDistanceStrict, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Job, JobStatus } from '@/types/domain'

const CLINIC_PENDING_STATUS: JobStatus = 'En clínica (sin citar)'
const CLINIC_SCHEDULED_STATUS: JobStatus = 'En clínica (citado)'

const normalizeElapsedDistanceText = (value: string) => {
    const normalized = value.trim()

    if (/^menos de un minuto$/i.test(normalized)) {
        return '1 minuto'
    }

    const nearYearsMatch = normalized.match(/^casi\s+(\d+)\s+años$/i)
    if (nearYearsMatch) {
        return `${nearYearsMatch[1]} años`
    }

    return normalized.replace(/\balrededor(?: de)?\s*/i, '').trim()
}

const parseDate = (value: string | null) => {
    if (!value) return null

    const parsed = parseISO(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

export const isClinicSchedulingTransition = (fromStatus: JobStatus, toStatus: JobStatus) => {
    return (
        (fromStatus === CLINIC_PENDING_STATUS && toStatus === CLINIC_SCHEDULED_STATUS)
        || (fromStatus === CLINIC_SCHEDULED_STATUS && toStatus === CLINIC_PENDING_STATUS)
    )
}

export const shouldResetJobStatusTimer = (fromStatus: JobStatus, toStatus: JobStatus) => {
    if (fromStatus === toStatus) return false
    if (toStatus === 'Cerrado') return false
    if (isClinicSchedulingTransition(fromStatus, toStatus)) return false
    return true
}

export const getJobTimerStart = (job: Pick<Job, 'status_timer_started_at' | 'order_date'>) => {
    return parseDate(job.status_timer_started_at) ?? parseDate(job.order_date)
}

export const getJobTimerEnd = (job: Pick<Job, 'status_timer_stopped_at'>, now = new Date()) => {
    return parseDate(job.status_timer_stopped_at) ?? now
}

export const getJobElapsedDays = (
    job: Pick<Job, 'order_date' | 'status_timer_started_at' | 'status_timer_stopped_at'>,
    now = new Date(),
) => {
    const startedAt = getJobTimerStart(job)
    if (!startedAt) return -1

    return differenceInCalendarDays(getJobTimerEnd(job, now), startedAt)
}

export const formatJobElapsedText = (
    job: Pick<Job, 'order_date' | 'status_timer_started_at' | 'status_timer_stopped_at'>,
    now = new Date(),
) => {
    const startedAt = getJobTimerStart(job)
    if (!startedAt) return '-'

    const stoppedAt = parseDate(job.status_timer_stopped_at)
    if (stoppedAt) {
        return normalizeElapsedDistanceText(formatDistance(startedAt, stoppedAt, { locale: es }))
    }

    const distance = normalizeElapsedDistanceText(formatDistance(startedAt, now, { locale: es }))
    return `hace ${distance}`
}

export const formatElapsedSeconds = (value: number | null | undefined) => {
    if (value == null || value < 0) return null
    if (value === 0) return '0 segundos'

    return formatDistanceStrict(new Date(0), new Date(value * 1000), { locale: es })
}

export const applyOptimisticJobStatusTransition = (job: Job, nextStatus: JobStatus, changedAt = new Date().toISOString()) => {
    if (job.status === nextStatus) return job

    const currentStart = job.status_timer_started_at ?? job.order_date ?? changedAt

    if (nextStatus === 'Cerrado') {
        return {
            ...job,
            status: nextStatus,
            status_timer_started_at: currentStart,
            status_timer_stopped_at: changedAt,
        }
    }

    if (shouldResetJobStatusTimer(job.status, nextStatus)) {
        return {
            ...job,
            status: nextStatus,
            status_timer_started_at: changedAt,
            status_timer_stopped_at: null,
            ten_day_notification_sent_at: null,
        }
    }

    return {
        ...job,
        status: nextStatus,
        status_timer_started_at: currentStart,
        status_timer_stopped_at: null,
    }
}