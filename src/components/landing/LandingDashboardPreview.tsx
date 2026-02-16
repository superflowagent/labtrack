import React from 'react'
import { landingJobs } from '@/lib/landingDemo'

export const LandingDashboardPreview: React.FC = () => {
    return (
        <div className="relative">
            <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-teal-100/40 via-slate-100 to-cyan-100/20 dark:from-teal-500/20 dark:via-background dark:to-cyan-400/10" />
            <div className="relative rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-2xl dark:bg-card dark:border-border">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600 dark:text-slate-300">Dashboard</div>
                    <div className="flex gap-2">
                        <span className="h-2 w-2 rounded-full bg-teal-400" />
                        <span className="h-2 w-2 rounded-full bg-cyan-300" />
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                    </div>
                </div>
                <div className="mt-6 space-y-3">
                    {landingJobs.map((job) => {
                        const pillClass =
                            job.status === 'En laboratorio'
                                ? 'rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700'
                                : job.status === 'En clinica (sin citar)'
                                    ? 'rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700'
                                    : job.status === 'En clinica (citado)'
                                        ? 'rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700'
                                        : 'rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700'

                        return (
                            <div
                                key={job.id}
                                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:bg-background dark:border-border"
                            >
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{job.job}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{job.lab}</p>
                                </div>
                                <span className={pillClass}>{job.status}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}


