import * as React from 'react'
import { Button } from './button'
import { X } from 'lucide-react'

type SnackbarProps = {
    open: boolean
    message: React.ReactNode
    actionLabel?: string
    duration?: number
    onAction?: () => void | Promise<void>
    onClose?: () => void
}

export const Snackbar: React.FC<SnackbarProps> = ({
    open,
    message,
    actionLabel = 'Deshacer',
    duration = 7000,
    onAction,
    onClose,
}) => {
    const [progress, setProgress] = React.useState(100)
    const [progressKey, setProgressKey] = React.useState(0)
    const onCloseRef = React.useRef(onClose)

    // keep latest onClose in a ref so effect below doesn't re-run on every render
    React.useEffect(() => {
        onCloseRef.current = onClose
    }, [onClose])

    React.useEffect(() => {
        if (!open) return

        // bump key so the inner progress element is recreated (forces CSS animation restart)
        setProgressKey((k) => k + 1)

        // initialize progress at full and start the shrink on next paint for a reliable transition
        setProgress(100)
        let raf1: number | null = null
        let raf2: number | null = null

        raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => {
                setProgress(0)
            })
        })

        const closeTimer = window.setTimeout(() => onCloseRef.current?.(), duration)

        return () => {
            if (raf1 != null) cancelAnimationFrame(raf1)
            if (raf2 != null) cancelAnimationFrame(raf2)
            clearTimeout(closeTimer)
        }
    }, [open, duration])

    if (!open) return null

    return (
        <div className="fixed right-6 bottom-6 z-50 w-[360px] max-w-[calc(100%-48px)]">
            <div className="relative flex items-center justify-between gap-4 overflow-hidden rounded-md border border-slate-200 bg-white px-4 py-3 shadow-md">
                <div className="flex-1 text-sm text-slate-900 text-left">{message}</div>

                <div className="flex items-center gap-2">
                    {onAction && (
                        <Button variant="ghost" size="sm" onClick={() => { onAction?.(); onCloseRef.current?.(); }}>
                            {actionLabel}
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0" aria-label="Cerrar" onClick={() => onCloseRef.current?.()}>
                        <X className="h-4 w-4" aria-hidden />
                    </Button>
                </div>

                {/* progress bar */}
                <div className="absolute left-0 bottom-0 h-1 w-full bg-slate-100">
                    <div
                        key={progressKey}
                        className="h-1 bg-teal-600"
                        style={{ width: `${progress}%`, transition: `width ${duration}ms linear`, willChange: 'width' }}
                    />
                </div>
            </div>
        </div>
    )
}

