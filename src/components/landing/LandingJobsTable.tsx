import React, { useEffect, useRef } from 'react'
import { FlaskConical, CheckCircle2, User, Clock } from 'lucide-react'
import { landingJobs } from '@/lib/landingDemo'

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'En laboratorio':
            return <FlaskConical className="h-4 w-4" />
        case 'En clinica (sin citar)':
            return <User className="h-4 w-4" />
        case 'En clinica (citado)':
            return <Clock className="h-4 w-4" />
        case 'Cerrado':
            return <CheckCircle2 className="h-4 w-4" />
        default:
            return null
    }
}

const getStatusBgClass = (status: string) => {
    switch (status) {
        case 'En laboratorio':
            return 'bg-yellow-50 text-yellow-700'
        case 'En clinica (sin citar)':
            return 'bg-orange-100 text-orange-800'
        case 'En clinica (citado)':
            return 'bg-purple-50 text-purple-700'
        case 'Cerrado':
            return 'bg-blue-50 text-blue-700'
        default:
            return 'bg-slate-50 text-slate-700'
    }
}

export const LandingJobsTable: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReduced) {
            const el = containerRef.current
            if (el) {
                el.style.transform = 'perspective(1200px) rotateX(0deg)'
            }
            return
        }

        const maxTilt = 18
        let frame = 0

        const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

        const update = () => {
            const el = containerRef.current
            if (!el) return

            const rect = el.getBoundingClientRect()
            const viewportHeight = window.innerHeight || 0
            const rawProgress = (viewportHeight - rect.top) / (viewportHeight * 0.7)
            const progress = clamp(rawProgress, 0, 1)
            const tilt = maxTilt * (1 - progress)

            el.style.transform = `perspective(1200px) rotateX(${tilt.toFixed(2)}deg)`
        }

        const onScroll = () => {
            if (frame) return
            frame = window.requestAnimationFrame(() => {
                frame = 0
                update()
            })
        }

        update()
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)

        return () => {
            if (frame) window.cancelAnimationFrame(frame)
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
        }
    }, [])



    return (
        <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-primary/20 dark:bg-primary/15 blur-lg" />
            <div
                ref={containerRef}
                className="relative rounded-xl border border-slate-200 bg-card pt-6 px-6 pb-4 shadow-2xl dark:border-border will-change-transform transform-gpu backdrop-blur-sm"
                style={{ transform: 'perspective(1200px) rotateX(12deg)', transformOrigin: 'center bottom' }}
            >
                {/* Browser header with title */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Trabajos</h3>
                    <div className="flex gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="h-2 w-2 rounded-full bg-yellow-400" />
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Paciente</th>
                                <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Trabajo</th>
                                <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Laboratorio</th>
                                <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Especialista</th>
                                <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Estado</th>
                                <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Fecha</th>
                                <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Transcurrido</th>
                            </tr>
                        </thead>
                        <tbody>
                            {landingJobs.map((job) => (
                                <tr
                                    key={job.id}
                                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                                >
                                    <td className="py-4 px-4 text-slate-900 dark:text-slate-100 font-medium">{job.patient}</td>
                                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300">{job.job}</td>
                                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300">{job.lab}</td>
                                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300">{job.specialist}</td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${getStatusBgClass(job.status)}`}>
                                            {getStatusIcon(job.status)}
                                            <span className="hidden sm:inline">{job.status}</span>
                                            <span className="sm:hidden">
                                                {job.status.includes('laboratorio') && 'Lab'}
                                                {job.status.includes('sin citar') && 'Sin cita'}
                                                {job.status.includes('citado') && 'Citado'}
                                                {job.status === 'Cerrado' && 'Cerrado'}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-xs">{job.date}</td>
                                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-xs font-medium">{job.elapsed}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
