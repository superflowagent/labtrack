import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { BadgeCheck, Clock, Archive, FlaskConical } from 'lucide-react'
import type { JobStatus } from '@/types/domain'

const STATUS_COLORS: Record<JobStatus, string> = {
  'En laboratorio': 'bg-blue-100 text-blue-800 border-blue-200',
  'En clinica (sin citar)': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'En clinica (citado)': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Cerrado': 'bg-slate-200 text-slate-600 border-slate-300',
}

const STATUS_ICONS: Record<JobStatus, ReactNode> = {
  'En laboratorio': <FlaskConical className="w-4 h-4 mr-1" />,
  'En clinica (sin citar)': <Clock className="w-4 h-4 mr-1" />,
  'En clinica (citado)': <BadgeCheck className="w-4 h-4 mr-1" />,
  'Cerrado': <Archive className="w-4 h-4 mr-1" />,
}

export function StatusBadge({ status, className }: { status: JobStatus, className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium transition-colors select-none',
        STATUS_COLORS[status],
        className
      )}
    >
      {STATUS_ICONS[status]}
      {status}
    </span>
  )
}
