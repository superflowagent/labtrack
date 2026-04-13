import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Archive, CalendarCheck, Clock, FlaskConical, Send } from 'lucide-react'
import type { JobStatus } from '@/types/domain'

const STATUS_COLORS: Record<JobStatus, string> = {
  'En laboratorio': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'En envío': 'bg-sky-50 text-sky-700 border-sky-200',
  'En clínica (sin citar)': 'bg-orange-50 text-orange-800 border-orange-200',
  'En clínica (citado)': 'bg-purple-50 text-purple-700 border-purple-200',
  'Cerrado': 'bg-blue-50 text-blue-700 border-blue-200',
}

const STATUS_ICONS: Record<JobStatus, ReactNode> = {
  'En laboratorio': <FlaskConical className="w-4 h-4 mr-1" />,
  'En envío': <Send className="w-4 h-4 mr-1" />,
  'En clínica (sin citar)': <Clock className="w-4 h-4 mr-1" />,
  'En clínica (citado)': <CalendarCheck className="w-4 h-4 mr-1" />,
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
