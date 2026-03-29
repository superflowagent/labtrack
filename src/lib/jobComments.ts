import type { AppRole, Job } from '@/types/domain'

const toTimestamp = (value: string | null) => {
    if (!value) return 0
    const timestamp = new Date(value).getTime()
    return Number.isNaN(timestamp) ? 0 : timestamp
}

export const hasUnreadJobComments = (job: Job, actorRole: AppRole) => {
    if (!job.last_comment_at || !job.last_comment_by_role) return false
    if (job.last_comment_by_role === actorRole) return false

    const lastSeenAt = actorRole === 'clinic'
        ? job.clinic_last_viewed_comment_at
        : job.laboratory_last_viewed_comment_at

    return toTimestamp(job.last_comment_at) > toTimestamp(lastSeenAt)
}
