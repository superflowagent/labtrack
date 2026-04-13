import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowRight, MessageSquareMore, Send } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatElapsedSeconds } from '@/lib/jobStatusTimer'
import { createJobComment, fetchJobComments, markJobCommentsAsSeen } from '@/services/supabase/jobComments'
import { cn } from '@/lib/utils'
import type { AppRole, Job, JobComment } from '@/types/domain'

type JobCommentsPanelProps = {
    job: Job
    actorRole: AppRole
    onJobPatch?: (patch: Partial<Job>) => void
}

const formatTimestamp = (value: string) => format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: es })

export function JobCommentsPanel({ job, actorRole, onJobPatch }: JobCommentsPanelProps) {
    const [comments, setComments] = useState<JobComment[]>([])
    const [draft, setDraft] = useState('')
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const loadedRef = useRef(false)
    const listRef = useRef<HTMLDivElement | null>(null)
    const jobPatchRef = useRef(onJobPatch)

    useEffect(() => {
        jobPatchRef.current = onJobPatch
    }, [onJobPatch])

    const emitJobPatch = (patch: Partial<Job>) => {
        jobPatchRef.current?.(patch)
    }

    useEffect(() => {
        if (!job.laboratory_id) {
            setComments([])
            setError(null)
            loadedRef.current = true
            return
        }

        let mounted = true
        loadedRef.current = false
        setLoading(true)
        setError(null)

        fetchJobComments(job.id)
            .then((items) => {
                if (!mounted) return
                setComments(items)
                loadedRef.current = true
            })
            .catch((err) => {
                if (!mounted) return
                setError(err instanceof Error ? err.message : 'No se pudieron cargar los comentarios')
            })
            .finally(() => {
                if (mounted) setLoading(false)
            })

        return () => {
            mounted = false

            if (!loadedRef.current || !job.laboratory_id) return

            const seenAt = new Date().toISOString()
            void markJobCommentsAsSeen(job.id, actorRole, seenAt)
                .then(() => {
                    emitJobPatch(
                        actorRole === 'clinic'
                            ? { clinic_last_viewed_comment_at: seenAt }
                            : { laboratory_last_viewed_comment_at: seenAt },
                    )
                })
                .catch(() => { })
        }
    }, [actorRole, job.id, job.laboratory_id])

    useEffect(() => {
        if (!listRef.current) return
        listRef.current.scrollTop = listRef.current.scrollHeight
    }, [comments])

    const commentPlaceholder = actorRole === 'clinic'
        ? 'Escribe un comentario para el laboratorio'
        : 'Escribe un comentario para la clínica'

    const renderedComments = useMemo(() => {
        if (loading) {
            return <p className="text-sm text-slate-500">Cargando comentarios...</p>
        }

        if (error) {
            return <p className="text-sm text-rose-600">{error}</p>
        }

        if (comments.length === 0) {
            return <p className="text-sm text-slate-500">Todavía no hay comentarios en este trabajo.</p>
        }

        return comments.map((comment) => {
            if (comment.comment_kind === 'status_change') {
                const actorName = comment.actor_display_name || 'Alguien'
                const previousElapsedText = formatElapsedSeconds(comment.previous_status_elapsed_seconds)

                return (
                    <div key={comment.id} className="flex justify-center">
                        <div className="max-w-[92%] rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-center text-sm text-slate-700 shadow-sm">
                            {comment.previous_status && comment.next_status ? (
                                <div className="flex flex-wrap items-center justify-center gap-2 text-slate-700">
                                    <StatusBadge status={comment.previous_status} className="bg-white" />
                                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                                    <StatusBadge status={comment.next_status} className="bg-white" />
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap leading-5">{comment.body}</p>
                            )}
                            <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-slate-500">
                                <span className="text-left">
                                    {previousElapsedText ? `(${previousElapsedText})` : ''}
                                </span>
                                <span className="text-right">
                                    {formatTimestamp(comment.created_at)} - {actorName}
                                </span>
                            </div>
                        </div>
                    </div>
                )
            }

            const isOwn = comment.sender_role === actorRole

            return (
                <div key={comment.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                    <div
                        className={cn(
                            'max-w-[85%] rounded-md px-3 py-2 shadow-sm',
                            isOwn ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-800',
                        )}
                    >
                        <p className="min-w-0 whitespace-pre-wrap text-sm leading-5">{comment.body}</p>
                        <div className={cn('mt-1 text-[11px]', isOwn ? 'text-white/75' : 'text-slate-400')}>
                            {formatTimestamp(comment.created_at)}
                        </div>
                    </div>
                </div>
            )
        })
    }, [actorRole, comments, error, loading])

    const handleSend = async () => {
        const message = draft.trim()
        if (!message) return

        setSending(true)
        setError(null)

        try {
            const created = await createJobComment(job, actorRole, message)
            setComments((current) => [...current, created])
            setDraft('')

            emitJobPatch({
                last_comment_at: created.created_at,
                last_comment_by_role: actorRole,
                ...(actorRole === 'clinic'
                    ? { clinic_last_viewed_comment_at: created.created_at }
                    : { laboratory_last_viewed_comment_at: created.created_at }),
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo enviar el comentario')
        } finally {
            setSending(false)
        }
    }

    if (!job.laboratory_id) {
        return (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                Asigna un laboratorio al trabajo para abrir la conversación.
            </div>
        )
    }

    return (
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2">
                <MessageSquareMore className="h-4 w-4 text-slate-500" />
                <div>
                    <p className="text-sm font-semibold text-slate-900">Conversación</p>
                </div>
            </div>

            <div ref={listRef} className="h-[320px] space-y-2 overflow-y-auto rounded-md bg-white p-3 ring-1 ring-slate-200">
                {renderedComments}
            </div>

            <div className="relative">
                <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                            event.preventDefault()
                            void handleSend()
                        }
                    }}
                    rows={2}
                    placeholder={commentPlaceholder}
                    className="flex min-h-[72px] w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 pr-12 text-sm text-slate-900 ring-1 ring-slate-200 shadow-xs outline-none placeholder:text-slate-400"
                />
                <Button
                    type="button"
                    size="icon"
                    className="absolute bottom-2 right-2 h-8 w-8 bg-teal-600 text-white hover:bg-teal-500"
                    disabled={sending || !draft.trim()}
                    onClick={() => void handleSend()}
                >
                    <Send className="h-3.5 w-3.5" />
                    <span className="sr-only">{sending ? 'Enviando comentario' : 'Enviar comentario'}</span>
                </Button>
            </div>
        </div>
    )
}
