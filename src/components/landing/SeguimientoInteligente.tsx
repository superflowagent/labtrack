import React, { useEffect, useRef, useState } from 'react'
import { FlaskConical, Hospital, CalendarCheck, CheckCircle2 } from 'lucide-react'

export const SeguimientoInteligente: React.FC = () => {
    const scrollerRef = useRef<HTMLDivElement | null>(null)
    const [progress, setProgress] = useState<number>(0)
    const lastProgress = useRef<number>(-1)

    useEffect(() => {
        let rafId = 0
        const onScroll = () => {
            const el = scrollerRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            const sectionTop = rect.top + window.scrollY
            const triggerLine = window.innerHeight * 0.5
            const start = sectionTop - triggerLine
            const end = sectionTop + rect.height - triggerLine
            let pct = (window.scrollY - start) / (end - start)
            pct = Number.isFinite(pct) ? pct : 0
            const clamped = Math.max(0, Math.min(1, pct))
            const value = Math.round(clamped * 100)
            if (value !== lastProgress.current) {
                lastProgress.current = value
                cancelAnimationFrame(rafId)
                rafId = requestAnimationFrame(() => setProgress(value))
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
        onScroll()
        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
            cancelAnimationFrame(rafId)
        }
    }, [])

    const checkpoints = [
        'Laboratorio',
        'En clínica (sin citar)',
        'En clínica (citado)',
        'Cerrado'
    ]
    const displayLabels = [
        <>Laboratorio</>,
        <>En clínica<br />(sin citar)</>,
        <>En clínica<br />(citado)</>,
        <>Cerrado</>,
    ]
    const positions = checkpoints.map((_, i) => Math.round((i / (checkpoints.length - 1)) * 100))
    const icons = [FlaskConical, Hospital, CalendarCheck, CheckCircle2]

    return (
        <div ref={scrollerRef}>
            <div className="relative h-[160vh]">
                <div className="sticky top-[20vh] pt-8 pb-8">
                    <div className="w-full max-w-6xl mx-auto px-4">
                        <div className="text-center mb-6">
                            <p className="text-sm uppercase tracking-[0.3em] text-teal-600 mb-2">Seguimiento inteligente</p>
                            <h2 className="text-3xl sm:text-4xl font-semibold mb-4 leading-tight lg:whitespace-nowrap">Define de forma clara el estado de cada trabajo</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">Actualiza el estado de tus trabajos con un click</p>
                        </div>

                        <div role="region" aria-label="Seguimiento inteligente" className="relative mt-10 md:mt-12 py-6">
                            <div className="relative h-20">
                                {/* progress bar starts after first icon and ends before last */}
                                <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-4 bg-slate-100/60 dark:bg-slate-800/60 rounded-full overflow-hidden z-0">
                                    <div
                                        className="h-4 bg-primary/80 transition-[width] duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                        role="progressbar"
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={progress}
                                    />
                                </div>

                                {/* icon row only, so bar crosses true center */}
                                <div className="absolute inset-0 flex items-center justify-between z-10">
                                    {checkpoints.map((label, i) => {
                                        const pos = positions[i]
                                        const active = progress >= pos
                                        const Icon = icons[i]
                                        return (
                                            <div key={label} className="w-20 flex justify-center">
                                                <div
                                                    className={`relative flex items-center justify-center h-20 w-20 rounded-full border-2 transition-transform duration-300 hover:scale-125 ${active ? 'bg-white border-primary text-primary scale-110 shadow-md' : 'bg-background border-slate-200 text-slate-400'}`}
                                                >
                                                    <Icon className="h-9 w-9" strokeWidth={1.5} aria-hidden />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* labels row separated from icon geometry */}
                            <div className="mt-3 flex items-start justify-between">
                                {checkpoints.map((label, i) => {
                                    const pos = positions[i]
                                    const active = progress >= pos
                                    return (
                                        <div key={`${label}-label`} className="w-20 text-center">
                                            <div className={`text-sm leading-snug ${active ? 'text-primary font-semibold' : 'text-slate-500'}`}>{displayLabels[i]}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
