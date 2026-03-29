import { useCallback, useEffect, useMemo, useState } from 'react'
import { deleteNotification, fetchNotificationsForActor, fetchUnreadNotificationCountForActor, markNotificationAsRead } from '@/services/supabase/notifications'
import type { AppActor, AppNotification } from '@/types/domain'

export const useNotifications = (actor: AppActor) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [items, unreadTotal] = await Promise.all([
                fetchNotificationsForActor(actor),
                fetchUnreadNotificationCountForActor(actor),
            ])
            setNotifications(items)
            setUnreadCount(unreadTotal)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudieron cargar las notificaciones')
        } finally {
            setLoading(false)
        }
    }, [actor])

    useEffect(() => {
        void load()

        const refresh = () => {
            void load()
        }

        const interval = window.setInterval(refresh, 30000)
        window.addEventListener('notificationsChanged', refresh)
        return () => {
            window.clearInterval(interval)
            window.removeEventListener('notificationsChanged', refresh)
        }
    }, [load])

    const unreadBadgeLabel = useMemo(() => (unreadCount > 20 ? '+20' : `${unreadCount}`), [unreadCount])

    const markAsRead = useCallback(async (notificationId: string) => {
        setNotifications((current) => current.map((item) => (
            item.id === notificationId ? { ...item, read_at: item.read_at || new Date().toISOString() } : item
        )))
        setUnreadCount((current) => Math.max(0, current - 1))

        try {
            await markNotificationAsRead(notificationId)
        } catch {
            void load()
        }
    }, [load])

    const removeNotification = useCallback(async (notificationId: string) => {
        const previous = notifications
        setNotifications((current) => current.filter((item) => item.id !== notificationId))

        try {
            await deleteNotification(notificationId)
        } catch {
            setNotifications(previous)
            void load()
        }
    }, [load, notifications])

    return {
        notifications,
        unreadCount,
        unreadBadgeLabel,
        loading,
        error,
        reload: load,
        markAsRead,
        removeNotification,
    }
}