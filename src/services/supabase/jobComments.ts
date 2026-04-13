import { supabase } from './client'
import type { AppRole, Job, JobComment } from '@/types/domain'

export const fetchJobComments = async (jobId: string) => {
    const { data, error } = await supabase
        .from('job_comments')
        .select('id, job_id, clinic_id, laboratory_id, sender_role, body, comment_kind, actor_display_name, previous_status, next_status, previous_status_elapsed_seconds, created_at')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true })

    if (error) throw error
    return (data ?? []) as JobComment[]
}

export const createJobComment = async (job: Job, senderRole: AppRole, body: string) => {
    if (!job.laboratory_id) {
        throw new Error('Asigna un laboratorio al trabajo antes de comentar.')
    }

    const { data, error } = await supabase
        .from('job_comments')
        .insert({
            job_id: job.id,
            clinic_id: job.clinic_id,
            laboratory_id: job.laboratory_id,
            sender_role: senderRole,
            body,
            comment_kind: 'comment',
            actor_display_name: window.actorDisplayName ?? null,
        })
        .select('id, job_id, clinic_id, laboratory_id, sender_role, body, comment_kind, actor_display_name, previous_status, next_status, previous_status_elapsed_seconds, created_at')
        .single()

    if (error) throw error
    return data as JobComment
}

export const markJobCommentsAsSeen = async (jobId: string, actorRole: AppRole, seenAt: string) => {
    const column = actorRole === 'clinic' ? 'clinic_last_viewed_comment_at' : 'laboratory_last_viewed_comment_at'

    const { error } = await supabase
        .from('jobs')
        .update({ [column]: seenAt })
        .eq('id', jobId)

    if (error) throw error
}
