import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Bell, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { useActor } from '@/contexts/ActorContext'
import { useNotifications } from '@/hooks/useNotifications'
import type { AppNotification, JobStatus } from '@/types/domain'

type NotificationCenterProps = {
    onNotificationClick?: (notification: AppNotification) => void
}

const isJobStatus = (value: unknown): value is JobStatus => {
    return value === 'En laboratorio'
        || value === 'En envío'
        || value === 'En clínica (sin citar)'
        || value === 'En clínica (citado)'
        || value === 'Cerrado'
}

const renderNotificationBody = (notification: AppNotification) => {
    const laboratoryName = typeof notification.metadata.laboratoryName === 'string'
        ? notification.metadata.laboratoryName
        : null
    const status = notification.metadata.status

    if (notification.type === 'job_sent_from_lab' && laboratoryName && isJobStatus(status)) {
        return (
            <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm text-slate-600">
                <span>{laboratoryName} ha marcado un trabajo como</span>
                <StatusBadge status={status} className="inline-flex align-middle" />
            </span>
        )
    }

    return <span className="text-sm text-slate-600">{notification.body}</span>
}

export function NotificationCenter({ onNotificationClick }: NotificationCenterProps) {
    const actor = useActor()
    const { notifications, unreadCount, loading, error, markAsRead, removeNotification } = useNotifications(actor)
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="relative border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                    <Bell className="h-4 w-4" />
                    <span className="sr-only">Abrir notificaciones</span>
                    {unreadCount > 0 ? (
                        <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
                            {unreadCount}
                        </span>
                    ) : null}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[360px] p-0">
                <div className="border-b border-slate-200 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-900">Notificaciones</h3>
                </div>
                <div className="max-h-[420px] overflow-y-auto">
                    {loading ? <p className="px-4 py-6 text-sm text-slate-500">Cargando notificaciones...</p> : null}
                    {error && !loading ? <p className="px-4 py-6 text-sm text-rose-600">{error}</p> : null}
                    {!loading && !error && notifications.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-slate-500">No hay notificaciones todavía.</p>
                    ) : null}
                    {!loading && !error ? notifications.map((notification) => {
                        const isUnread = !notification.read_at
                        return (
                            <div
                                key={notification.id}
                                className={`relative border-b border-slate-100 transition-colors ${isUnread ? 'bg-teal-50/60' : 'bg-white'}`}
                            >
                                <button
                                    type="button"
                                    className="flex w-full flex-col gap-1 px-4 py-3 pr-12 text-left hover:bg-slate-50"
                                    onClick={() => {
                                        void markAsRead(notification.id)
                                        onNotificationClick?.(notification)
                                        setOpen(false)
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm font-medium text-slate-900">{notification.title}</span>
                                        <span className="text-[11px] text-slate-500">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                                        </span>
                                    </div>
                                    <div>{renderNotificationBody(notification)}</div>
                                </button>
                                <button
                                    type="button"
                                    className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        void removeNotification(notification.id)
                                    }}
                                    aria-label="Borrar notificación"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )
                    }) : null}
                </div>
            </PopoverContent>
        </Popover>
    )
}