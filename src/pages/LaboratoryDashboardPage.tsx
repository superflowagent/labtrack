import { differenceInCalendarDays, formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useCallback, useEffect, useMemo, useState, startTransition } from 'react'
import { Archive, ClipboardList, FlaskConical, Send, Settings } from 'lucide-react'
import { JobCommentsPanel } from '@/components/JobCommentsPanel'
import { NotificationCenter } from '@/components/NotificationCenter'
import { SectionHeader } from '@/components/SectionHeader'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardFooter } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination } from '@/components/ui/pagination'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useActor } from '@/contexts/ActorContext'
import { useLaboratoryJobs } from '@/hooks/useLaboratoryJobs'
import { hasUnreadJobComments } from '@/lib/jobComments'
import { createClinicNotificationForLabStatus } from '@/services/supabase/notifications'
import { updateJobRecord } from '@/services/supabase/queries'
import { cn, formatFullName, normalizeSearch } from '@/lib/utils'
import type { Job, JobStatus } from '@/types/domain'

type LaboratoryVisibleStatus = 'En laboratorio' | 'En envío' | 'Cerrado'

const STATUSES: LaboratoryVisibleStatus[] = ['En laboratorio', 'En envío', 'Cerrado']

const getLaboratoryVisibleStatus = (status: JobStatus): LaboratoryVisibleStatus => {
    switch (status) {
        case 'En laboratorio':
            return 'En laboratorio'
        case 'En envío':
            return 'En envío'
        default:
            return 'Cerrado'
    }
}

const getStatusTextClass = (status?: LaboratoryVisibleStatus) => {
    switch (status) {
        case 'En laboratorio':
            return 'text-yellow-600'
        case 'En envío':
            return 'text-sky-700'
        case 'Cerrado':
            return 'text-blue-600'
        default:
            return ''
    }
}

const getStatusIcon = (status: LaboratoryVisibleStatus) => {
    switch (status) {
        case 'En laboratorio':
            return <FlaskConical className="h-3.5 w-3.5 shrink-0" />
        case 'En envío':
            return <Send className="h-3.5 w-3.5 shrink-0" />
        case 'Cerrado':
            return <Archive className="h-3.5 w-3.5 shrink-0" />
    }
}

const getStatusClassName = (status: LaboratoryVisibleStatus) => {
    switch (status) {
        case 'En laboratorio':
            return 'bg-yellow-50 text-yellow-700'
        case 'En envío':
            return 'bg-sky-50 text-sky-700'
        case 'Cerrado':
            return 'bg-blue-50 text-blue-700'
    }
}

type LaboratoryJobDialogProps = {
    open: boolean
    job: Job | null
    patientName: string
    clinicName: string
    savingJobId: string | null
    onOpenChange: (open: boolean) => void
    onJobPatched: (job: Job) => void
    onRequestShippingConfirmation: (job: Job) => void
}

function LaboratoryJobDialog({
    open,
    job,
    patientName,
    clinicName,
    savingJobId,
    onOpenChange,
    onJobPatched,
    onRequestShippingConfirmation,
}: LaboratoryJobDialogProps) {
    if (!job) return null

    const visibleStatus = getLaboratoryVisibleStatus(job.status)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Trabajo</DialogTitle>
                    <DialogDescription>Consulta el detalle del trabajo y conversa con la clínica desde aquí.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-md border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Paciente</p>
                        <p className="mt-2 text-base font-semibold text-slate-900">{patientName || '-'}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Trabajo</p>
                        <p className="mt-2 text-base font-semibold text-slate-900">{job.job_description || 'Sin descripción'}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Clínica</p>
                        <p className="mt-2 text-base text-slate-700">{clinicName}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Estado</p>
                        <span className={cn('mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium', getStatusClassName(visibleStatus))}>
                            {visibleStatus}
                        </span>
                    </div>
                </div>

                {job.status === 'En laboratorio' ? (
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 rounded-md border-sky-200 bg-sky-50 px-4 text-sky-700 shadow-none hover:bg-sky-100 hover:text-sky-800"
                            disabled={savingJobId === job.id}
                            onClick={() => onRequestShippingConfirmation(job)}
                        >
                            <Send className="h-3.5 w-3.5" />
                            {savingJobId === job.id ? 'Actualizando...' : 'Envío'}
                        </Button>
                    </div>
                ) : null}

                <JobCommentsPanel
                    job={job}
                    actorRole="laboratory"
                    onJobPatch={(patch) => onJobPatched({ ...job, ...patch })}
                />
            </DialogContent>
        </Dialog>
    )
}

function LaboratoryDashboardPage() {
    const actor = useActor()
    if (actor.role !== 'laboratory') {
        throw new Error('LaboratoryDashboardPage requires a laboratory actor')
    }

    const [section, setSection] = useState<'trabajos' | 'ajustes'>('trabajos')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | LaboratoryVisibleStatus>('all')
    const [maxDaysElapsed, setMaxDaysElapsed] = useState(0)
    const [page, setPage] = useState(1)
    const [savingJobId, setSavingJobId] = useState<string | null>(null)
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [jobOpen, setJobOpen] = useState(false)
    const [pendingShippingJob, setPendingShippingJob] = useState<Job | null>(null)
    const { jobs, patientsById, access, loading, error, updateLocalJob } = useLaboratoryJobs(actor.laboratory.id, actor.clinic.name, actor.laboratory.name)

    useEffect(() => {
        const setter = (nextSection: 'trabajos' | 'laboratorios' | 'especialistas' | 'pacientes' | 'ajustes') => {
            startTransition(() => setSection(nextSection === 'ajustes' ? 'ajustes' : 'trabajos'))
        }
        window.setDashboardSection = setter
        window.dashboardSection = section
        window.dispatchEvent(new Event('dashboardSectionChanged'))
        return () => {
            if (window.setDashboardSection === setter) {
                window.setDashboardSection = undefined
            }
        }
    }, [section])

    const now = useMemo(() => new Date(), [])

    const rows = useMemo(() => jobs.map((job) => {
        const patient = job.patient_id ? patientsById[job.patient_id] : undefined
        const fullName = formatFullName(patient?.name, patient?.lastname)
        const orderDate = job.order_date ? parseISO(job.order_date) : null
        const elapsedDays = orderDate ? differenceInCalendarDays(now, orderDate) : -1
        return {
            job,
            visibleStatus: getLaboratoryVisibleStatus(job.status),
            patientName: fullName,
            searchText: normalizeSearch(`${fullName} ${job.job_description || ''}`),
            orderDateText: orderDate ? orderDate.toLocaleDateString('es-ES') : '-',
            elapsedText: orderDate ? formatDistanceToNow(orderDate, { addSuffix: true, locale: es }) : '-',
            elapsedDays,
            hasUnreadComments: hasUnreadJobComments(job, 'laboratory'),
        }
    }), [jobs, now, patientsById])

    const filteredRows = useMemo(() => {
        const query = normalizeSearch(search)
        return rows.filter((row) => {
            const matchesQuery = query ? row.searchText.includes(query) : true
            const matchesStatus = statusFilter !== 'all' ? row.visibleStatus === statusFilter : row.visibleStatus !== 'Cerrado'
            const matchesElapsed = maxDaysElapsed > 0 ? row.elapsedDays >= maxDaysElapsed : true
            return matchesQuery && matchesStatus && matchesElapsed
        })
    }, [maxDaysElapsed, rows, search, statusFilter])

    const maxElapsedDays = useMemo(() => {
        const values = rows
            .filter((row) => {
                const query = normalizeSearch(search)
                const matchesQuery = query ? row.searchText.includes(query) : true
                const matchesStatus = statusFilter !== 'all' ? row.visibleStatus === statusFilter : row.visibleStatus !== 'Cerrado'
                return matchesQuery && matchesStatus
            })
            .map((row) => row.elapsedDays)
            .filter((elapsedDays) => elapsedDays >= 0)

        return values.length ? Math.max(...values) : 0
    }, [rows, search, statusFilter])

    const effectiveMaxDaysElapsed = Math.min(maxDaysElapsed, maxElapsedDays)
    const isElapsedDisabled = rows.length === 0
    const activeFiltersCount = [search.trim(), statusFilter !== 'all' ? statusFilter : '', effectiveMaxDaysElapsed > 0 ? 'elapsed' : '']
        .filter(Boolean)
        .length

    const pageSize = 50
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
    const effectivePage = Math.min(page, totalPages)
    const paginatedRows = useMemo(() => {
        const start = (effectivePage - 1) * pageSize
        return filteredRows.slice(start, start + pageSize)
    }, [effectivePage, filteredRows])

    const handleMoveToShipping = async (jobId: string) => {
        const job = jobs.find((item) => item.id === jobId)
        if (!job || job.status !== 'En laboratorio') return

        const previous = job
        const nextJob = { ...job, status: 'En envío' as JobStatus }
        updateLocalJob(nextJob)
        setSavingJobId(jobId)

        try {
            const updated = await updateJobRecord(jobId, { status: 'En envío' })
            updateLocalJob(updated)
            if (selectedJob?.id === updated.id) {
                setSelectedJob(updated)
            }
        } catch {
            updateLocalJob(previous)
            return
        } finally {
            setSavingJobId(null)
        }

        void createClinicNotificationForLabStatus({ ...previous, status: 'En envío' }, actor.laboratory.name).catch(() => { })
    }

    const handleConfirmShipping = async () => {
        if (!pendingShippingJob) return

        await handleMoveToShipping(pendingShippingJob.id)
        setPendingShippingJob(null)
    }

    const handleJobPatched = (job: Job) => {
        updateLocalJob(job)
        if (jobOpen) {
            setSelectedJob(job)
        }
    }

    const handleJobOpenChange = (open: boolean) => {
        setJobOpen(open)
        if (!open) {
            setSelectedJob(null)
        }
    }

    const handleNotificationClick = useCallback((notification: { job_id: string | null }) => {
        if (!notification.job_id) return

        const job = jobs.find((item) => item.id === notification.job_id)
        if (!job) return

        startTransition(() => setSection('trabajos'))
        setSelectedJob(job)
        setJobOpen(true)
    }, [jobs])

    const selectedPatientName = selectedJob?.patient_id ? formatFullName(patientsById[selectedJob.patient_id]?.name, patientsById[selectedJob.patient_id]?.lastname) : ''

    const sectionTitle = section === 'trabajos' ? 'Trabajos' : 'Ajustes'

    const sectionContent = section === 'trabajos' ? (
        <Card className="border-slate-200 bg-white/80 p-3 md:p-5 mb-0 flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4 mb-4">
                <div className="space-y-2 w-full md:w-auto md:flex-1">
                    <Label>Buscar</Label>
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por paciente o trabajo" />
                </div>
                <div className="space-y-2 w-full md:w-auto md:flex-1">
                    <Label>Estado</Label>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as 'all' | LaboratoryVisibleStatus)}
                    >
                        <SelectTrigger className={cn('transition-colors', statusFilter !== 'all' ? getStatusTextClass(statusFilter) : '')}>
                            <SelectValue placeholder="Todos">
                                {statusFilter !== 'all' ? (
                                    <span className="flex items-center gap-2">
                                        {getStatusIcon(statusFilter)}
                                        {statusFilter}
                                    </span>
                                ) : (
                                    'Todos'
                                )}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {STATUSES.map((status) => (
                                <SelectItem key={status} value={status} className={getStatusTextClass(status)}>
                                    <span className="flex items-center gap-2">
                                        {getStatusIcon(status)}
                                        {status}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 w-full md:w-auto md:flex-1 relative pb-[10px]">
                    <Label>Transcurrido (días)</Label>
                    <div className="relative mt-4">
                        <input
                            type="range"
                            min={0}
                            max={Math.max(0, maxElapsedDays)}
                            step={1}
                            value={effectiveMaxDaysElapsed}
                            onChange={(event) => setMaxDaysElapsed(Number(event.target.value))}
                            className="w-full accent-teal-600 transition-all duration-150 ease-in-out disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Filtrar por días transcurridos"
                            disabled={isElapsedDisabled}
                        />
                        <div
                            className="absolute top-0 text-sm text-slate-600 pointer-events-none whitespace-nowrap transition-all duration-150 ease-in-out"
                            style={{ left: `${maxElapsedDays ? (effectiveMaxDaysElapsed / maxElapsedDays) * 100 : 0}%`, transform: 'translate(-50%, -100%)' }}
                        >
                            {!isElapsedDisabled && effectiveMaxDaysElapsed > 0 ? `≥ ${effectiveMaxDaysElapsed}d` : ''}
                        </div>
                    </div>
                </div>
                {activeFiltersCount > 0 ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs hover:bg-rose-100 hover:text-rose-700 h-10 mb-[12px] md:mb-[2px] w-full md:w-[110px] shrink-0"
                        onClick={() => {
                            setSearch('')
                            setStatusFilter('all')
                            setMaxDaysElapsed(0)
                        }}
                    >
                        Restablecer
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                            {activeFiltersCount}
                        </span>
                    </Button>
                ) : (
                    <div className="hidden md:block w-[110px] shrink-0" aria-hidden="true" />
                )}
            </div>
            <div className="p-0 flex-1 min-h-0 overflow-auto">
                <Table className="min-w-[920px] w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Paciente</TableHead>
                            <TableHead>Trabajo</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Transcurrido</TableHead>
                            <TableHead className="text-right">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-sm text-slate-500">Cargando trabajos...</TableCell>
                            </TableRow>
                        ) : null}
                        {error && !loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-sm text-rose-600">{error}</TableCell>
                            </TableRow>
                        ) : null}
                        {!loading && !error && filteredRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-sm text-slate-500">No hay trabajos con esos filtros.</TableCell>
                            </TableRow>
                        ) : null}
                        {!loading && !error ? paginatedRows.map((row) => (
                            <TableRow
                                key={row.job.id}
                                className={cn('cursor-pointer hover:bg-slate-50', row.hasUnreadComments ? 'bg-amber-50/70 ring-1 ring-inset ring-amber-200 hover:bg-amber-50' : '')}
                                onClick={(event) => {
                                    const target = event.target as HTMLElement
                                    if (target.closest('button, a, input, select, textarea, [role="button"]')) return

                                    setSelectedJob(row.job)
                                    setJobOpen(true)
                                }}
                            >
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <span>{row.patientName || '-'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{row.job.job_description || 'Sin descripción'}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClassName(row.visibleStatus)}`}>
                                        {row.visibleStatus}
                                    </span>
                                </TableCell>
                                <TableCell>{row.orderDateText}</TableCell>
                                <TableCell>{row.elapsedText}</TableCell>
                                <TableCell className="text-right">
                                    {row.job.status === 'En laboratorio' ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 rounded-md border-sky-200 bg-sky-50 px-3 text-sky-700 shadow-none hover:bg-sky-100 hover:text-sky-800"
                                            disabled={savingJobId === row.job.id}
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                setPendingShippingJob(row.job)
                                            }}
                                        >
                                            <Send className="h-3.5 w-3.5" />
                                            {savingJobId === row.job.id ? 'Actualizando...' : 'Envío'}
                                        </Button>
                                    ) : (
                                        <span className="text-xs text-slate-400">Sin acciones</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        )) : null}
                    </TableBody>
                </Table>
            </div>
            <CardFooter>
                <Pagination total={filteredRows.length} page={effectivePage} pageSize={pageSize} onPageChange={setPage} />
            </CardFooter>
        </Card>
    ) : (
        <Card className="border-slate-200 bg-white/80 p-6">
            <div className="space-y-6">
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Laboratorio</h2>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{actor.laboratory.name}</p>
                </div>
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Clínica</h2>
                    <p className="mt-2 text-base text-slate-700">{actor.clinic.name}</p>
                </div>
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Email de acceso</h2>
                    <p className="mt-2 text-base text-slate-700">{access?.email || actor.access.email}</p>
                </div>
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Estado del acceso</h2>
                    <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        {actor.access.is_active ? 'Acceso activo' : 'Acceso revocado'}
                    </p>
                </div>
            </div>
        </Card>
    )

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="mx-auto w-full px-3 md:px-6 pt-2 md:pt-4 pb-4 md:pb-6 h-screen flex flex-col">
                <SectionHeader
                    icon={section === 'trabajos' ? <ClipboardList className="h-5 w-5 text-slate-500" /> : <Settings className="h-5 w-5 text-slate-500" />}
                    title={sectionTitle}
                    newButton={<NotificationCenter onNotificationClick={handleNotificationClick} />}
                />
                <div className="flex-1 min-h-0 flex flex-col">{sectionContent}</div>
                <LaboratoryJobDialog
                    open={jobOpen}
                    job={selectedJob}
                    patientName={selectedPatientName}
                    clinicName={actor.clinic.name}
                    savingJobId={savingJobId}
                    onOpenChange={handleJobOpenChange}
                    onJobPatched={handleJobPatched}
                    onRequestShippingConfirmation={setPendingShippingJob}
                />
                <AlertDialog open={!!pendingShippingJob} onOpenChange={(open) => { if (!open) setPendingShippingJob(null) }}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar envío</AlertDialogTitle>
                            <AlertDialogDescription className="leading-relaxed">
                                Este trabajo pasará a estado <StatusBadge status="En envío" className="mx-1 inline-flex align-middle" /> y la clínica recibirá la actualización.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={!!savingJobId}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-teal-600 text-white hover:bg-teal-500"
                                disabled={!!savingJobId}
                                onClick={() => void handleConfirmShipping()}
                            >
                                {savingJobId ? 'Actualizando...' : 'Confirmar envío'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}

export default LaboratoryDashboardPage