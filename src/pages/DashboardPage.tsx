import { format, formatDistanceToNow, parseISO, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { useDeferredValue, useEffect, useMemo, useRef, useState, startTransition, type ReactNode } from 'react'
import { normalizeSearch } from '@/lib/utils'
import { ClipboardPlus, FlaskConical, Stethoscope, UserRound, Clock, CalendarCheck, Archive } from 'lucide-react'
import { Filtros } from '@/components/Filtros'
import { SectionHeader } from '@/components/SectionHeader'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardFooter } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select'
import { Snackbar } from '@/components/ui/snackbar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useJobs } from '@/hooks/useJobs'
import { supabase } from '@/services/supabase/client'
import { getClinicForUser } from '@/services/supabase/clinic'
import {
  createLaboratory,
  createPatient,
  createSpecialist,
  deleteJob,
  deleteLaboratory,
  deletePatient,
  deleteSpecialist,
  updateJob,
  updateLaboratory,
  updatePatient,
  updateSpecialist,
} from '@/services/supabase/queries'
import type { Job, JobStatus, Laboratory, Specialist, Patient } from '@/types/domain'
import { LaboratoriesTable, PatientsTable, SpecialistsTable } from './LaboratoriesSpecialistsTables'
import ClinicSettings from '@/pages/ClinicSettings'

const STATUSES: JobStatus[] = [
  'En laboratorio',
  'En clinica (sin citar)',
  'En clinica (citado)',
  'Cerrado',
]

const getStatusTextClass = (status?: string) => {
  switch (status) {
    case 'En laboratorio':
      return 'text-yellow-600'
    case 'En clinica (sin citar)':
      return 'text-orange-700'
    case 'En clinica (citado)':
      return 'text-purple-600'
    case 'Cerrado':
      return 'text-blue-600'
    default:
      return ''
  }
}

const getStatusPillClass = (status?: string) => {
  // versión compacta del badge para la tabla (menor padding y altura)
  switch (status) {
    case 'En laboratorio':
      return 'w-full flex items-center justify-between gap-2 h-7 rounded-full bg-yellow-50 px-3 py-0.5 text-xs font-medium text-yellow-700'
    case 'En clinica (sin citar)':
      return 'w-full flex items-center justify-between gap-2 h-7 rounded-full bg-orange-100 px-3 py-0.5 text-xs font-medium text-orange-800'
    case 'En clinica (citado)':
      return 'w-full flex items-center justify-between gap-2 h-7 rounded-full bg-purple-50 px-3 py-0.5 text-xs font-medium text-purple-700'
    case 'Cerrado':
      return 'w-full flex items-center justify-between gap-2 h-7 rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-700'
    default:
      return 'w-full flex items-center justify-between gap-2 h-7 rounded-full bg-teal-50 px-3 py-0.5 text-xs font-medium text-teal-700'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'En laboratorio':
      return <FlaskConical className="h-3.5 w-3.5 shrink-0" />
    case 'En clinica (sin citar)':
      return <Clock className="h-3.5 w-3.5 shrink-0" />
    case 'En clinica (citado)':
      return <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
    case 'Cerrado':
      return <Archive className="h-3.5 w-3.5 shrink-0" />
    default:
      return null
  }
}

const capitalizeFirst = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

type JobForm = {
  patient_id: string
  job_description: string
  laboratory_id: string
  specialist_id: string
  order_date: Date
  status: JobStatus
}

type BasicFilters = {
  paciente?: string
  laboratorioId?: string
  estado?: string
}

const getEmptyJobForm = (): JobForm => ({
  patient_id: '',
  job_description: '',
  laboratory_id: '',
  specialist_id: '',
  order_date: new Date(),
  status: STATUSES[0],
})

function DashboardPage() {
  const [section, setSection] = useState<'trabajos' | 'laboratorios' | 'especialistas' | 'pacientes' | 'ajustes'>('trabajos')
  const { jobs, labs, specialists, patients, loading, error, addJob, reload, updateLocalJobStatus } = useJobs()

  const patientsById = useMemo(() => {
    const m: Record<string, typeof patients[number]> = {}
    patients.forEach((p) => { if (p?.id) m[p.id] = p })
    return m
  }, [patients])

  const labsById = useMemo(() => {
    const m: Record<string, typeof labs[number]> = {}
    labs.forEach((l) => { if (l?.id) m[l.id] = l })
    return m
  }, [labs])

  const specsById = useMemo(() => {
    const m: Record<string, typeof specialists[number]> = {}
    specialists.forEach((s) => { if (s?.id) m[s.id] = s })
    return m
  }, [specialists])

  const sectionTitle =
    section === 'trabajos' ? 'Trabajos' :
      section === 'laboratorios' ? 'Laboratorios' :
        section === 'especialistas' ? 'Especialistas' :
          section === 'ajustes' ? 'Ajustes' :
            'Pacientes'



  // Reusable renderer for patient preview (keeps spacing consistent between trigger & list)
  // - `inset` adds left padding useful for dropdown items
  // - compact (default) reduces gap/min-width for the trigger so code and name sit closer
  const PatientPreview = ({ patientId, placeholder = 'Seleccionar paciente', inset = false }: { patientId?: string; placeholder?: string; inset?: boolean }) => {
    const p = patientId ? patientsById[patientId] : undefined
    const gapClass = inset ? 'gap-2' : 'gap-1'
    // use a fixed width in the dropdown list so the name always starts at the same position
    // ensure long codes are truncated (no overlap) and show full code on hover
    const codeWidthClass = inset ? 'w-12 flex-none truncate whitespace-nowrap overflow-hidden' : 'min-w-[2rem]'

    return (
      <div className={`flex items-center ${gapClass} w-full justify-start ${inset ? 'pl-2' : ''}`}>
        {/* Only reserve space for the code when a patient is selected */}
        {patientId ? (
          <span title={p?.code ?? undefined} className={`${codeWidthClass} text-left text-xs text-slate-500`}>{p?.code ?? ''}</span>
        ) : null}
        <span className={(patientId ? 'text-slate-700 ' : 'text-slate-500 ') + 'flex-1 truncate text-sm text-left'}>
          {p?.name ?? placeholder}
        </span>
      </div>
    )
  }

  useEffect(() => {
    const setter = (s: 'trabajos' | 'laboratorios' | 'especialistas' | 'pacientes' | 'ajustes') => startTransition(() => setSection(s))
    window.setDashboardSection = setter
    return () => {
      if (window.setDashboardSection === setter) {
        window.setDashboardSection = undefined
      }
    }
  }, [setSection])

  useEffect(() => {
    // keep the global dashboardSection in sync and notify listeners
    window.dashboardSection = section
    window.dispatchEvent(new Event('dashboardSectionChanged'))
  }, [section])

  // Eliminado: lógica de billingBlocked y billingChecked



  useEffect(() => {
    const initDashboard = async () => {
      const clinic = await getClinicForUser()
      if (clinic?.name) {
        window.clinicName = clinic.name
        window.dispatchEvent(new Event('clinicNameChanged'))
      }
    }
    initDashboard().catch(() => { })
  }, [])

  const defaultFilters = {
    trabajo: '',
    laboratorioId: 'all',
    estado: 'all',
    sortBy: 'paciente',
    sortDir: 'asc',
    maxDaysElapsed: 0, // 0 = no filter, otherwise show jobs with Transcurrido >= value (days)
  }

  const [filters, setFilters] = useState(defaultFilters)
  const [labsFilters, setLabsFilters] = useState<BasicFilters>({ paciente: '' })
  const [specialistsFilters, setSpecialistsFilters] = useState<BasicFilters>({ paciente: '' })
  const [patientsFilters, setPatientsFilters] = useState<BasicFilters>({ paciente: '' })

  const [open, setOpen] = useState(false)
  const [editingJobId, setEditingJobId] = useState<string | null>(null)
  const [form, setForm] = useState(getEmptyJobForm)
  // track whether the datepicker was manually interacted with
  const [orderDateInteracted, setOrderDateInteracted] = useState(false)
  const [orderDatePopoverOpen, setOrderDatePopoverOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingJob, setDeletingJob] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  // patient select local state
  const [patientQuery, setPatientQuery] = useState('')
  const [pendingPatientSelection, setPendingPatientSelection] = useState(false)

  // === Onboarding: mostrar spotlight sobre "Nuevo trabajo" la primera vez que un usuario entra al dashboard ===
  const [showNewJobOnboarding, setShowNewJobOnboarding] = useState(false)
  const newJobButtonRef = useRef<HTMLButtonElement | null>(null)
  const [spotRect, setSpotRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null)

  const markNewJobSeen = async () => {
    try {
      await supabase.auth.updateUser({ data: { seen_new_job_cta: true } })
    } catch {
      // ignore failures silently
    }
  }

  useEffect(() => {
    if (open) setPatientQuery('')
  }, [open])

  useEffect(() => {
    // comprueba metadata del usuario y decide si mostrar onboarding
    let mounted = true
      ; (async () => {
        try {
          const { data, error } = await supabase.auth.getUser()
          if (error || !data.user) return
          const userMetadata = (data.user.user_metadata as unknown) as Record<string, unknown> | null
          const seen = !!(userMetadata && userMetadata['seen_new_job_cta'])
          if (!seen && mounted) {
            setShowNewJobOnboarding(true)
            // calcula la posición del botón tras un pequeño delay (render)
            setTimeout(() => {
              const btn = newJobButtonRef.current
              if (btn) {
                const r = btn.getBoundingClientRect()
                setSpotRect({ top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height })
              }
            }, 100)
          }
        } catch {
          // noop
        }
      })()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!showNewJobOnboarding) return
    const update = () => {
      const btn = newJobButtonRef.current
      if (!btn) return
      const r = btn.getBoundingClientRect()
      setSpotRect({ top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height })
    }

    // Cierra el onboarding si el usuario interactúa en cualquier parte de la ventana
    // registramos varios tipos de evento (pointerdown, touchstart, click) para cubrir
    // desktop, touch y casos donde `click` podría no dispararse.
    const handleAnyClick = () => {
      setShowNewJobOnboarding(false)
      void markNewJobSeen()
    }

    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    window.addEventListener('pointerdown', handleAnyClick, true)
    window.addEventListener('touchstart', handleAnyClick, true)
    window.addEventListener('click', handleAnyClick, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('pointerdown', handleAnyClick, true)
      window.removeEventListener('touchstart', handleAnyClick, true)
      window.removeEventListener('click', handleAnyClick, true)
    }
  }, [showNewJobOnboarding])

  useEffect(() => {
    // si el modal de 'Nuevo trabajo' se abre, marca el onboarding como visto
    if (open && showNewJobOnboarding) {
      setShowNewJobOnboarding(false)
      void markNewJobSeen()
    }
  }, [open, showNewJobOnboarding])

  const [labOpen, setLabOpen] = useState(false)
  const [editingLabId, setEditingLabId] = useState<string | null>(null)
  const [labForm, setLabForm] = useState({ name: '', phone: '', email: '' })
  const [labSaving, setLabSaving] = useState(false)
  const [deletingLab, setDeletingLab] = useState(false)
  const [labFormError, setLabFormError] = useState<string | null>(null)

  const [specOpen, setSpecOpen] = useState(false)
  const [editingSpecId, setEditingSpecId] = useState<string | null>(null)
  const [specForm, setSpecForm] = useState({ name: '', specialty: '', phone: '', email: '' })
  const [specSaving, setSpecSaving] = useState(false)
  const [deletingSpec, setDeletingSpec] = useState(false)
  const [specFormError, setSpecFormError] = useState<string | null>(null)

  const [patientOpen, setPatientOpen] = useState(false)
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null)
  const [patientForm, setPatientForm] = useState({ name: '', phone: '', email: '', code: '' })
  const [patientSaving, setPatientSaving] = useState(false)
  const [deletingPatient, setDeletingPatient] = useState(false)
  const [patientFormError, setPatientFormError] = useState<string | null>(null)

  const [snackbar, setSnackbar] = useState<{ open: boolean; kind?: 'job' | 'lab' | 'spec' | 'patient'; item?: Job | Laboratory | Specialist | Patient | null; message?: string }>({ open: false })
  const [updatingStatusFor, setUpdatingStatusFor] = useState<string | null>(null)

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.trabajo?.trim()) count += 1
    if (filters.laboratorioId !== 'all') count += 1
    if (filters.estado !== 'all') count += 1
    if (filters.maxDaysElapsed && filters.maxDaysElapsed > 0) count += 1
    return count
  }, [filters])

  const deferredTrabajo = useDeferredValue(filters.trabajo)
  const normalizedTrabajoQuery = useMemo(() => normalizeSearch(deferredTrabajo), [deferredTrabajo])
  const now = useMemo(() => new Date(), [])
  const formatter = useMemo(
    () => new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    [],
  )

  const jobsMeta = useMemo(() => {
    if (section !== 'trabajos') return []
    return jobs.map((job) => {
      const patient = job.patient_id ? patientsById[job.patient_id] : undefined
      const labName = job.laboratory_id ? (labsById[job.laboratory_id]?.name || '') : ''
      const specName = job.specialist_id ? (specsById[job.specialist_id]?.name || '') : ''
      const jobDesc = job.job_description || ''
      const patientName = patient?.name || ''
      const patientCode = patient?.code || ''
      const patientPhone = patient?.phone || ''
      const waUrl = patientPhone
        ? `https://wa.me/${patientPhone}?text=${encodeURIComponent(`Hola ${patientName},\nYa tenemos el trabajo (${jobDesc}) disponible en clínica.\nPor favor, contáctanos para agendar una cita.\n¡Gracias!`)}`
        : ''
      const searchText = normalizeSearch([jobDesc, patientName, patientCode].filter(Boolean).join(' '))

      return {
        job,
        labName,
        specName,
        patientName,
        patientCode,
        patientPhone,
        waUrl,
        searchText,
      }
    })
  }, [jobs, labsById, specsById, patientsById, section])

  const jobsForElapsed = useMemo(() => {
    if (section !== 'trabajos') return []
    return jobsMeta.filter(({ job, searchText }) => {
      const q = normalizedTrabajoQuery
      const matchQuery = q ? searchText.includes(q) : true
      const matchLab = filters.laboratorioId !== 'all' ? job.laboratory_id === filters.laboratorioId : true
      // Mostrar por defecto TODOS los estados excepto 'Cerrado'.
      // Si el usuario selecciona explícitamente un estado (p. ej. 'Cerrado'), mostrar solo ese estado.
      const matchEstado = filters.estado !== 'all' ? job.status === filters.estado : job.status !== 'Cerrado'

      return matchQuery && matchLab && matchEstado
    })
  }, [jobsMeta, normalizedTrabajoQuery, filters.laboratorioId, filters.estado, section])

  const filteredJobs = useMemo(() => {
    if (section !== 'trabajos') return []
    let filtered = jobsForElapsed.filter(({ job }) => {
      if (typeof filters.maxDaysElapsed === 'number' && filters.maxDaysElapsed > 0) {
        if (!job.order_date) return false
        const elapsedDays = differenceInCalendarDays(now, parseISO(job.order_date))
        return elapsedDays >= filters.maxDaysElapsed
      }

      return true
    })

    filtered = filtered.slice().sort((a, b) => {
      const compare = (x: string, y: string) => x.localeCompare(y)
      let cmp = 0
      switch (filters.sortBy) {
        case 'paciente':
          cmp = compare(a.patientName, b.patientName)
          break
        case 'trabajo':
          cmp = compare(a.job.job_description || '', b.job.job_description || '')
          break
        case 'laboratorio':
          cmp = compare(a.labName, b.labName)
          break
        case 'especialista':
          cmp = compare(a.specName, b.specName)
          break
        case 'estado':
          cmp = compare(a.job.status, b.job.status)
          break
        default:
          cmp = 0
      }
      return filters.sortDir === 'asc' ? cmp : -cmp
    })

    return filtered
  }, [filters.maxDaysElapsed, filters.sortBy, filters.sortDir, jobsForElapsed, now, section])

  const [jobsPage, setJobsPage] = useState(1)
  // fixed page size per your request (max 50)
  const jobsPageSize = 50


  const jobsTotalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPageSize))
  const jobsEffectivePage = Math.min(jobsPage, jobsTotalPages)

  const paginatedJobs = useMemo(() => {
    if (section !== 'trabajos') return []
    const start = (jobsEffectivePage - 1) * jobsPageSize
    return filteredJobs.slice(start, start + jobsPageSize)
  }, [filteredJobs, jobsEffectivePage, jobsPageSize, section])

  const maxElapsedDays = useMemo(() => {
    if (section !== 'trabajos') return 0
    const values = paginatedJobs
      .map(({ job }) => (job.order_date ? differenceInCalendarDays(now, parseISO(job.order_date)) : -1))
      .filter((d) => d >= 0)
    return values.length ? Math.max(...values) : 0
  }, [paginatedJobs, now, section])

  const visibleJobs = useMemo(() => {
    if (section !== 'trabajos') return []
    return paginatedJobs.map((meta) => {
      const orderDate = meta.job.order_date ? parseISO(meta.job.order_date) : null
      const orderDateText = orderDate ? formatter.format(orderDate) : '-'
      const elapsedText = orderDate
        ? capitalizeFirst(formatDistanceToNow(orderDate, { locale: es, addSuffix: true }).replace(/\balrededor(?: de)?\s*/i, ''))
        : '-'
      return {
        ...meta,
        orderDateText,
        elapsedText,
      }
    })
  }, [paginatedJobs, formatter, section])

  const sliderMax = Math.max(0, maxElapsedDays)
  const isElapsedDisabled = section !== 'trabajos' || paginatedJobs.length === 0

  // if available max shrinks, clamp the current filter value so the slider/value stay consistent
  useEffect(() => {
    if (filters.maxDaysElapsed > 0 && maxElapsedDays > 0 && filters.maxDaysElapsed > maxElapsedDays) {
      setFilters((prev) => ({ ...prev, maxDaysElapsed: maxElapsedDays }))
    }
  }, [filters.maxDaysElapsed, maxElapsedDays])

  const filteredPatients = useMemo(() => {
    const query = patientQuery.trim().toLowerCase()
    if (!query) return patients
    return patients.filter((p) => p.name.toLowerCase().includes(query))
  }, [patientQuery, patients])

  const handleSaveJob = async () => {
    setSaving(true)
    setFormError(null)

    try {

      if (!form.patient_id) {
        throw new Error('Selecciona un paciente')
      }

      const orderDateValue: string | null = !editingJobId && !orderDateInteracted
        ? new Date().toISOString()
        : form.order_date
          ? format(form.order_date, 'yyyy-MM-dd')
          : null


      const payload = {
        patient_id: form.patient_id,
        job_description: form.job_description || null,
        laboratory_id: form.laboratory_id || null,
        specialist_id: form.specialist_id || null,
        order_date: orderDateValue,
        status: form.status,
      }

      if (editingJobId) {
        await updateJob(editingJobId, payload)
      } else {
        await addJob(payload)
      }

      setOpen(false)
      setEditingJobId(null)
      setForm(getEmptyJobForm())
      setOrderDateInteracted(false)
      await reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteJob = async () => {
    if (!editingJobId) return
    setDeletingJob(true)
    setFormError(null)
    try {
      const deleted = await deleteJob(editingJobId)
      setSnackbar({ open: true, kind: 'job', item: deleted, message: 'Trabajo eliminado' })
      setOpen(false)
      setEditingJobId(null)
      setForm(getEmptyJobForm())
      setOrderDateInteracted(false)
      await reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo eliminar')
    } finally {
      setDeletingJob(false)
    }
  }

  const handleQuickChangeStatus = async (jobId: string, status: JobStatus) => {
    const job = jobs.find((j) => j.id === jobId)
    if (!job || job.status === status) return

    const previous = job.status

    // Optimistic update local state
    updateLocalJobStatus(jobId, status)

    // No bloquear UI ni mostrar spinner
    updateJob(jobId, { status })
      .catch((err) => {
        // revert
        updateLocalJobStatus(jobId, previous)
        setSnackbar({ open: true, kind: 'job', item: null, message: err instanceof Error ? err.message : 'No se pudo actualizar' })
      })
  }

  const handleUndo = async () => {
    if (!snackbar.open || !snackbar.item) return
    const { kind, item } = snackbar
    setSnackbar({ open: false })
    try {
      if (kind === 'job') {
        const job = item as Job
        await addJob({
          patient_id: job.patient_id ?? '',
          job_description: job.job_description || null,
          laboratory_id: job.laboratory_id || null,
          specialist_id: job.specialist_id || null,
          order_date: job.order_date || null,
          status: job.status,
        })
        await reload()
        return
      }

      if (kind === 'lab') {
        const lab = item as Laboratory
        await createLaboratory({ name: lab.name, phone: lab.phone || null, email: lab.email || null })
        await reload()
        return
      }

      if (kind === 'spec') {
        const spec = item as Specialist
        await createSpecialist({ name: spec.name, specialty: spec.specialty || null, phone: spec.phone || null, email: spec.email || null })
        await reload()
        return
      }

      if (kind === 'patient') {
        const p = item as Patient
        await createPatient({ name: p.name, phone: p.phone || null, email: p.email || null, code: p.code || null })
        await reload()
        return
      }
    } catch {
      // ignore undo errors
    }
  }

  const handleCreateLab = async () => {
    setLabSaving(true)
    setLabFormError(null)
    try {
      if (!labForm.name.trim()) throw new Error('El nombre del laboratorio es obligatorio')
      if (editingLabId) {
        await updateLaboratory(editingLabId, {
          name: labForm.name.trim(),
          phone: labForm.phone || null,
          email: labForm.email || null,
        })
      } else {
        await createLaboratory({
          name: labForm.name.trim(),
          phone: labForm.phone || null,
          email: labForm.email || null,
        })
      }
      setLabOpen(false)
      setEditingLabId(null)
      setLabForm({ name: '', phone: '', email: '' })
      await reload()
    } catch (err) {
      setLabFormError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setLabSaving(false)
    }
  }

  const handleDeleteLab = async () => {
    if (!editingLabId) return
    setDeletingLab(true)
    setLabFormError(null)
    try {
      const deleted = await deleteLaboratory(editingLabId)
      setSnackbar({ open: true, kind: 'lab', item: deleted, message: 'Laboratorio eliminado' })
      setLabOpen(false)
      setEditingLabId(null)
      setLabForm({ name: '', phone: '', email: '' })
      await reload()
    } catch (err) {
      setLabFormError(err instanceof Error ? err.message : 'No se pudo eliminar')
    } finally {
      setDeletingLab(false)
    }
  }

  const handleCreateSpec = async () => {
    setSpecSaving(true)
    setSpecFormError(null)
    try {
      if (!specForm.name.trim()) throw new Error('El nombre del especialista es obligatorio')
      if (editingSpecId) {
        await updateSpecialist(editingSpecId, {
          name: specForm.name.trim(),
          specialty: specForm.specialty || null,
          phone: specForm.phone || null,
          email: specForm.email || null,
        })
      } else {
        await createSpecialist({
          name: specForm.name.trim(),
          specialty: specForm.specialty || null,
          phone: specForm.phone || null,
          email: specForm.email || null,
        })
      }
      setSpecOpen(false)
      setEditingSpecId(null)
      setSpecForm({ name: '', specialty: '', phone: '', email: '' })
      await reload()
    } catch (err) {
      setSpecFormError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSpecSaving(false)
    }
  }

  const handleDeleteSpec = async () => {
    if (!editingSpecId) return
    setDeletingSpec(true)
    setSpecFormError(null)
    try {
      const deleted = await deleteSpecialist(editingSpecId)
      setSnackbar({ open: true, kind: 'spec', item: deleted, message: 'Especialista eliminado' })
      setSpecOpen(false)
      setEditingSpecId(null)
      setSpecForm({ name: '', specialty: '', phone: '', email: '' })
      await reload()
    } catch (err) {
      setSpecFormError(err instanceof Error ? err.message : 'No se pudo eliminar')
    } finally {
      setDeletingSpec(false)
    }
  }

  const handleSavePatient = async () => {
    setPatientSaving(true)
    setPatientFormError(null)
    try {
      if (!patientForm.name.trim()) throw new Error('El nombre del paciente es obligatorio')
      const saved = editingPatientId
        ? await updatePatient(editingPatientId, {
          name: patientForm.name.trim(),
          phone: patientForm.phone || null,
          email: patientForm.email || null,
          code: patientForm.code || null,
        })
        : await createPatient({
          name: patientForm.name.trim(),
          phone: patientForm.phone || null,
          email: patientForm.email || null,
          code: patientForm.code || null,
        })

      // Si abrimos el modal de paciente desde el modal de trabajo, seleccionar el paciente creado
      let reopenJobModal = false
      if (pendingPatientSelection && saved?.id) {
        setForm((prev) => ({ ...prev, patient_id: saved.id }))
        reopenJobModal = true
      }

      // Cerrar modal paciente y limpiar formulario
      setPatientOpen(false)
      setEditingPatientId(null)
      setPatientForm({ name: '', phone: '', email: '', code: '' })

      // Reabrir el modal de trabajo si vino desde allí
      if (reopenJobModal) {
        setOpen(true)
        setPendingPatientSelection(false)
      }

      await reload()
    } catch (err) {
      setPatientFormError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setPatientSaving(false)
    }
  }

  const handleDeletePatient = async () => {
    if (!editingPatientId) return
    setDeletingPatient(true)
    setPatientFormError(null)
    try {
      const deleted = await deletePatient(editingPatientId)
      setSnackbar({ open: true, kind: 'patient', item: deleted, message: 'Paciente eliminado' })
      setPatientOpen(false)
      setEditingPatientId(null)
      setPatientForm({ name: '', phone: '', email: '', code: '' })
      await reload()
    } catch (err) {
      setPatientFormError(err instanceof Error ? err.message : 'No se pudo eliminar')
    } finally {
      setDeletingPatient(false)
    }
  }

  let sectionContent: ReactNode = null
  if (section === 'trabajos') {
    sectionContent = (
      <Card className="border-slate-200 bg-white/80 p-5 mb-0 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-2">
            <Label>Buscar</Label>
            <Input
              value={filters.trabajo}
              onChange={(event) => setFilters((prev) => ({ ...prev, trabajo: event.target.value }))}
              placeholder="Buscar por paciente o trabajo"
            />
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={filters.estado} onValueChange={(value) => setFilters((prev) => ({ ...prev, estado: value }))}>
              <SelectTrigger className={filters.estado !== 'all' ? getStatusTextClass(filters.estado) : ''}>
                <SelectValue placeholder="Todos" />
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
          <div className="space-y-2">
            <Label>Laboratorio</Label>
            <Select
              value={filters.laboratorioId}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, laboratorioId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {labs.map((lab) => (
                  <SelectItem key={lab.id} value={lab.id}>
                    {lab.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <Label>Transcurrido (días)</Label>
            <div className="relative mt-2">
              <input
                type="range"
                min={0}
                max={sliderMax}
                step={1}
                value={filters.maxDaysElapsed ?? 0}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxDaysElapsed: Number(e.target.value) }))}
                className="w-full accent-teal-600 transition-all duration-150 ease-in-out disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Filtrar por días transcurridos"
                disabled={isElapsedDisabled}
              />
              <div
                className="absolute top-0 text-sm text-slate-600 pointer-events-none whitespace-nowrap transition-all duration-150 ease-in-out"
                style={{ left: `${sliderMax ? ((filters.maxDaysElapsed ?? 0) / sliderMax) * 100 : 0}%`, transform: 'translate(-50%, -100%)' }}
              >
                {!isElapsedDisabled && filters.maxDaysElapsed && filters.maxDaysElapsed > 0 ? `≥ ${filters.maxDaysElapsed}d` : ''}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-start mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs hover:bg-rose-100 hover:text-rose-700"
            onClick={() => setFilters(defaultFilters)}
          >
            Restablecer filtros
            {activeFiltersCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>
        <div className="p-0 flex-1 min-h-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Paciente</TableHead>
                <TableHead>Trabajo</TableHead>
                <TableHead>Laboratorio</TableHead>
                <TableHead>Especialista</TableHead>
                <TableHead className="w-60 max-w-[16rem]">Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Transcurrido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-slate-500">
                    Cargando trabajos...
                  </TableCell>
                </TableRow>
              )}
              {error && !loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-rose-500">
                    {error}
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && filteredJobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-slate-500">
                    No hay trabajos con esos filtros.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                !error &&
                visibleJobs.map((meta) => {
                  const job = meta.job;
                  return (
                    <TableRow
                      key={job.id}
                      onClick={(e) => {
                        const target = e.target as HTMLElement
                        // ignore clicks from interactive controls (selects/buttons/links) — especially necessary because Radix portals bubble
                        if (target.closest('button, a, input, select, textarea, [role="button"]')) return

                        setEditingJobId(job.id);
                        setForm({
                          patient_id: job.patient_id || '',
                          job_description: job.job_description || '',
                          laboratory_id: job.laboratory_id || '',
                          specialist_id: job.specialist_id || '',
                          order_date: job.order_date ? parseISO(job.order_date) : new Date(),
                          status: job.status,
                        });
                        setOrderDateInteracted(true);
                        setOpen(true);
                      }}
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      <TableCell className="font-medium pl-6">
                        <div className="flex items-center gap-3">
                          <span className="w-10 text-right text-xs text-slate-500">{meta.patientCode || '-'}</span>
                          <span>{meta.patientName || '-'}</span>
                          {meta.patientPhone ? (
                            <a
                              href={meta.waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 shadow-sm transition-transform transform hover:scale-105"
                              title="Enviar WhatsApp"
                              tabIndex={0}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            >
                              <img src="/whatsapp.svg" alt="WhatsApp" className="w-4 h-4 pointer-events-none" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              aria-disabled="true"
                              tabIndex={-1}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                              className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-md bg-transparent border border-slate-100 text-slate-300 cursor-not-allowed opacity-60 filter grayscale"
                              title="Sin teléfono"
                            >
                              <img src="/whatsapp.svg" alt="WhatsApp" className="w-4 h-4 opacity-60 filter grayscale pointer-events-none" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{job.job_description || 'Sin descripción'}</TableCell>
                      <TableCell>{meta.labName || '-'}</TableCell>
                      <TableCell>{meta.specName || '-'}</TableCell>
                      <TableCell className="w-60 max-w-[16rem]">
                        <Select
                          value={job.status}
                          onValueChange={(v) => void handleQuickChangeStatus(job.id, v as JobStatus)}
                        >
                          <SelectTrigger
                            onClick={(e) => e.stopPropagation()}
                            className={getStatusPillClass(job.status) + ' w-full'}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <div className="flex items-center gap-2 truncate w-full">
                                <span className="truncate"><SelectValue /></span>
                              </div>

                              {/* fixed-size placeholder for spinner to prevent width shift */}
                              <span className="w-4 h-4 flex items-center justify-center">
                                {updatingStatusFor === job.id ? (
                                  <svg className="h-3 w-3 animate-spin text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                                    <path d="M22 12a10 10 0 0 1-10 10" strokeLinecap="round" />
                                  </svg>
                                ) : (
                                  <span className="h-3 w-3" aria-hidden />
                                )}
                              </span>
                            </div>
                          </SelectTrigger>

                          <SelectContent position="popper" onClick={(e) => e.stopPropagation()}>
                            <SelectItem value="En laboratorio" className={getStatusTextClass('En laboratorio')}>
                              <span className="flex items-center gap-2">{getStatusIcon('En laboratorio')}En laboratorio</span>
                            </SelectItem>
                            <SelectItem value="En clinica (sin citar)" className={getStatusTextClass('En clinica (sin citar)')}>
                              <span className="flex items-center gap-2">{getStatusIcon('En clinica (sin citar)')}En clinica (sin citar)</span>
                            </SelectItem>
                            <SelectItem value="En clinica (citado)" className={getStatusTextClass('En clinica (citado)')}>
                              <span className="flex items-center gap-2">{getStatusIcon('En clinica (citado)')}En clinica (citado)</span>
                            </SelectItem>
                            <SelectSeparator />
                            <SelectItem value="Cerrado" className={getStatusTextClass('Cerrado')}>
                              <span className="flex items-center gap-2">{getStatusIcon('Cerrado')}Cerrado</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{meta.orderDateText}</TableCell>
                      <TableCell>{meta.elapsedText}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
        <CardFooter>
          <Pagination
            total={filteredJobs.length}
            page={jobsEffectivePage}
            pageSize={jobsPageSize}
            onPageChange={setJobsPage}
          />
        </CardFooter>
      </Card>
    );
  } else if (section === 'laboratorios') {
    sectionContent = (
      <Card className="border-slate-200 bg-white/80 p-5 mb-0 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-end gap-4">
          <Dialog
            open={labOpen}
            onOpenChange={(value) => {
              setLabOpen(value)
              if (!value) {
                setEditingLabId(null)
                setLabForm({ name: '', phone: '', email: '' })
              }
            }}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingLabId ? 'Editar laboratorio' : 'Nuevo laboratorio'}</DialogTitle>
                <DialogDescription>
                  Completa la información del {editingLabId ? 'laboratorio' : 'nuevo laboratorio'}
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={async (event) => {
                  event.preventDefault()
                  await handleCreateLab()
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={labForm.name}
                    onChange={(event) => setLabForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Nombre del laboratorio"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Móvil</Label>
                  <Input
                    value={labForm.phone}
                    onChange={(event) => setLabForm((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="Teléfono de contacto"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={labForm.email}
                    onChange={(event) => setLabForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="Email del laboratorio"
                  />
                </div>
                {labFormError && <p className="text-sm text-rose-600">{labFormError}</p>}
                <div className="flex gap-4">
                  {editingLabId && (
                    <Button
                      type="button"
                      variant="destructive"
                      className="flex-1"
                      disabled={labSaving || deletingLab}
                      onClick={handleDeleteLab}
                    >
                      {deletingLab ? 'Eliminando...' : 'Eliminar laboratorio'}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={labSaving || deletingLab}
                    className="flex-1 bg-teal-600 text-white hover:bg-teal-500"
                  >
                    {labSaving ? 'Guardando...' : editingLabId ? 'Guardar cambios' : 'Guardar laboratorio'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Filtros
          asCard={false}
          filters={labsFilters}
          setFilters={setLabsFilters}
          showPaciente={true}
          showLaboratorio={false}
          showEstado={false}
        />
        <LaboratoriesTable
          asCard={false}
          labs={labs}
          filter={labsFilters.paciente ?? ''}
          onEdit={(lab) => {
            setEditingLabId(lab.id)
            setLabForm({ name: lab.name, phone: lab.phone || '', email: lab.email || '' })
            setLabOpen(true)
          }}
        />
      </Card>
    )
  } else if (section === 'especialistas') {
    sectionContent = (
      <Card className="border-slate-200 bg-white/80 p-5 mb-0 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-end gap-4">
          <Dialog
            open={specOpen}
            onOpenChange={(value) => {
              setSpecOpen(value)
              if (!value) {
                setEditingSpecId(null)
                setSpecForm({ name: '', specialty: '', phone: '', email: '' })
              }
            }}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingSpecId ? 'Editar especialista' : 'Nuevo especialista'}</DialogTitle>
                <DialogDescription>
                  Completa la información del {editingSpecId ? 'especialista' : 'nuevo especialista'}
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={async (event) => {
                  event.preventDefault()
                  await handleCreateSpec()
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={specForm.name}
                    onChange={(event) => setSpecForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Nombre del especialista"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Especialidad</Label>
                  <Input
                    value={specForm.specialty}
                    onChange={(event) => setSpecForm((prev) => ({ ...prev, specialty: event.target.value }))}
                    placeholder="Especialidad"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Móvil</Label>
                  <Input
                    value={specForm.phone}
                    onChange={(event) => setSpecForm((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="Teléfono de contacto"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={specForm.email}
                    onChange={(event) => setSpecForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="Email del especialista"
                  />
                </div>
                {specFormError && <p className="text-sm text-rose-600">{specFormError}</p>}
                <div className="flex gap-4">
                  {editingSpecId && (
                    <Button
                      type="button"
                      variant="destructive"
                      className="flex-1"
                      disabled={specSaving || deletingSpec}
                      onClick={handleDeleteSpec}
                    >
                      {deletingSpec ? 'Eliminando...' : 'Eliminar especialista'}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={specSaving || deletingSpec}
                    className="flex-1 bg-teal-600 text-white hover:bg-teal-500"
                  >
                    {specSaving ? 'Guardando...' : editingSpecId ? 'Guardar cambios' : 'Guardar especialista'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Filtros
          asCard={false}
          filters={specialistsFilters}
          setFilters={setSpecialistsFilters}
          showPaciente={true}
          showLaboratorio={false}
          showEstado={false}
        />
        <SpecialistsTable
          asCard={false}
          specialists={specialists}
          filter={specialistsFilters.paciente ?? ''}
          onEdit={(spec) => {
            setEditingSpecId(spec.id)
            setSpecForm({
              name: spec.name,
              specialty: spec.specialty || '',
              phone: spec.phone || '',
              email: spec.email || '',
            })
            setSpecOpen(true)
          }}
        />
      </Card>
    )
  } else if (section === 'pacientes') {
    sectionContent = (
      <Card className="border-slate-200 bg-white/80 p-5 mb-0 flex flex-col flex-1 min-h-0 overflow-hidden">
        <Filtros
          asCard={false}
          filters={patientsFilters}
          setFilters={setPatientsFilters}
          showPaciente={true}
          showLaboratorio={false}
          showEstado={false}
        />
        <PatientsTable
          asCard={false}
          patients={patients}
          filter={patientsFilters.paciente ?? ''}
          onEdit={(patient) => {
            setEditingPatientId(patient.id)
            setPatientForm({
              name: patient.name,
              phone: patient.phone || '',
              email: patient.email || '',
              code: patient.code || '',
            })
            setPatientOpen(true)
          }}
        />
      </Card>
    )
  } else if (section === 'ajustes') {
    sectionContent = <ClinicSettings />
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full px-6 pt-4 pb-6 h-screen flex flex-col">
        {/* Eliminado: lógica de bloqueo por suscripción */}
        <>
          <SectionHeader
            icon={
              section === 'trabajos' ? <ClipboardPlus className="h-5 w-5 text-slate-500" /> :
                section === 'laboratorios' ? <FlaskConical className="h-5 w-5 text-slate-500" /> :
                  section === 'especialistas' ? <Stethoscope className="h-5 w-5 text-slate-500" /> :
                    <UserRound className="h-5 w-5 text-slate-500" />
            }
            title={sectionTitle}
            newButton={(() => {
              if (section === 'trabajos') {
                return (
                  <Button
                    ref={newJobButtonRef}
                    className={`bg-teal-600 text-white hover:bg-teal-500 ${showNewJobOnboarding ? 'relative z-50 onboarding-cta' : ''}`}
                    onClick={() => {
                      setEditingJobId(null)
                      setForm(getEmptyJobForm())
                      setOrderDateInteracted(false)
                      setOpen(true)
                      if (showNewJobOnboarding) {
                        setShowNewJobOnboarding(false)
                        void markNewJobSeen()
                      }
                    }}
                  >
                    <ClipboardPlus className="mr-2 h-4 w-4" /> Nuevo trabajo
                  </Button>
                )
              }
              if (section === 'laboratorios') {
                return (
                  <Button className="bg-teal-600 text-white hover:bg-teal-500" onClick={() => { setEditingLabId(null); setLabForm({ name: '', phone: '', email: '' }); setLabOpen(true); }}>
                    <FlaskConical className="mr-2 h-4 w-4" /> Nuevo laboratorio
                  </Button>
                )
              }
              if (section === 'especialistas') {
                return (
                  <Button className="bg-teal-600 text-white hover:bg-teal-500" onClick={() => { setEditingSpecId(null); setSpecForm({ name: '', specialty: '', phone: '', email: '' }); setSpecOpen(true); }}>
                    <Stethoscope className="mr-2 h-4 w-4" /> Nuevo especialista
                  </Button>
                )
              }
              if (section === 'pacientes') {
                return (
                  <Button className="bg-teal-600 text-white hover:bg-teal-500" onClick={() => { setEditingPatientId(null); setPatientForm({ name: '', phone: '', email: '', code: '' }); setPatientOpen(true); setPendingPatientSelection(false); }}>
                    <UserRound className="mr-2 h-4 w-4" /> Nuevo paciente
                  </Button>
                )
              }
              return null
            })()}
          />

          <div className="flex-1 min-h-0 flex flex-col">{sectionContent}</div>
        </>
      </div>

      {showNewJobOnboarding && spotRect && (
        <div
          className="fixed inset-0 z-40 pointer-events-auto"
          aria-hidden
          onClick={() => {
            setShowNewJobOnboarding(false)
            void markNewJobSeen()
          }}
          onPointerDownCapture={() => {
            // asegurar que TOC/PTR/CLICK cierren el spotlight incluso si otros
            // handlers intermedian
            setShowNewJobOnboarding(false)
            void markNewJobSeen()
          }}
          onTouchStart={() => {
            setShowNewJobOnboarding(false)
            void markNewJobSeen()
          }}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

          <div
            style={{
              position: 'absolute',
              top: spotRect.top - 12,
              left: spotRect.left - 12,
              width: spotRect.width + 24,
              height: spotRect.height + 24,
              borderRadius: 10,
            }}
            className="onboarding-ring pointer-events-none"
          />

        </div>
      )}

      {/* --- Modal: Nuevo / Editar trabajo --- */}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value)
          if (!value) {
            setEditingJobId(null)
            setForm(getEmptyJobForm())
            setOrderDateInteracted(false)
            setFormError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingJobId ? 'Editar trabajo' : 'Nuevo trabajo'}</DialogTitle>
            <DialogDescription>
              Completa la información del trabajo y guarda los cambios.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={async (event) => {
              event.preventDefault()
              await handleSaveJob()
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Select
                  value={form.patient_id}
                  onValueChange={(value) => {
                    if (value === '__new') {
                      setPendingPatientSelection(true)
                      setOpen(false)
                      setPatientOpen(true)
                      return
                    }
                    setForm((prev) => ({ ...prev, patient_id: value === '__none' ? '' : value }))
                  }}
                >
                  <SelectTrigger>
                    <PatientPreview patientId={form.patient_id} placeholder="Seleccionar paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 pb-2">
                      <Input
                        placeholder="Buscar paciente..."
                        value={patientQuery}
                        onChange={(e) => setPatientQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    {filteredPatients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <PatientPreview patientId={p.id} inset />
                      </SelectItem>
                    ))}
                    <SelectSeparator />
                    <SelectItem value="__new">+ Nuevo paciente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Orden de trabajo</Label>
                <Input
                  value={form.job_description}
                  onChange={(e) => setForm((prev) => ({ ...prev, job_description: e.target.value }))}
                  placeholder="Orden de trabajo"
                />
              </div>

              <div className="space-y-2">
                <Label>Laboratorio</Label>
                <Select value={form.laboratory_id || ''} onValueChange={(v) => setForm((prev) => ({ ...prev, laboratory_id: v === '__none' ? '' : v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sin laboratorio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Sin laboratorio</SelectItem>
                    {labs.map((lab) => (
                      <SelectItem key={lab.id} value={lab.id}>{lab.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Especialista</Label>
                <Select value={form.specialist_id || ''} onValueChange={(v) => setForm((prev) => ({ ...prev, specialist_id: v === '__none' ? '' : v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sin especialista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Sin especialista</SelectItem>
                    {specialists.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Salida trabajo</Label>
                <Popover open={orderDatePopoverOpen} onOpenChange={setOrderDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-sm font-normal">
                      {form.order_date ? format(form.order_date, 'dd/MM/yyyy') : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <Calendar
                      mode="single"
                      selected={form.order_date}
                      onSelect={(d) => {
                        setForm((prev) => ({ ...prev, order_date: d as Date }))
                        setOrderDateInteracted(true)
                        setOrderDatePopoverOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm((prev) => ({ ...prev, status: v as JobStatus }))}>
                  <SelectTrigger className={form.status ? getStatusTextClass(form.status) : ''}>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((st) => (
                      <SelectItem key={st} value={st} className={getStatusTextClass(st)}>
                        <span className="flex items-center gap-2">
                          {getStatusIcon(st)}
                          {st}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formError && <p className="text-sm text-rose-600">{formError}</p>}

            <div className="flex gap-4">
              {editingJobId && (
                <Button type="button" variant="destructive" className="flex-1" disabled={saving || deletingJob} onClick={handleDeleteJob}>
                  {deletingJob ? 'Eliminando...' : 'Eliminar trabajo'}
                </Button>
              )}

              <Button type="submit" disabled={saving || deletingJob} className="flex-1 bg-teal-600 text-white hover:bg-teal-500">
                {saving ? 'Guardando...' : editingJobId ? 'Guardar cambios' : 'Guardar trabajo'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={patientOpen}
        onOpenChange={(value) => {
          setPatientOpen(value)
          if (!value) {
            const wasPending = pendingPatientSelection
            setEditingPatientId(null)
            setPatientForm({ name: '', phone: '', email: '', code: '' })
            setPendingPatientSelection(false)
            if (wasPending) setOpen(true)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPatientId ? 'Editar paciente' : 'Nuevo paciente'}</DialogTitle>
            <DialogDescription>
              Completa la informacion del {editingPatientId ? 'paciente' : 'nuevo paciente'}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (event) => {
              event.preventDefault()
              await handleSavePatient()
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={patientForm.code}
                onChange={(event) => setPatientForm((prev) => ({ ...prev, code: event.target.value }))}
                placeholder="Código del paciente"
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={patientForm.name}
                onChange={(event) => setPatientForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Nombre del paciente"
              />
            </div>
            <div className="space-y-2">
              <Label>Móvil</Label>
              <Input
                value={patientForm.phone}
                onChange={(event) => setPatientForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="Teléfono del paciente"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={patientForm.email}
                onChange={(event) => setPatientForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Email del paciente"
              />
            </div>
            {patientFormError && <p className="text-sm text-rose-600">{patientFormError}</p>}
            <div className="flex gap-4">
              {editingPatientId && (
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  disabled={patientSaving || deletingPatient}
                  onClick={handleDeletePatient}
                >
                  {deletingPatient ? 'Eliminando...' : 'Eliminar paciente'}
                </Button>
              )}
              <Button
                type="submit"
                disabled={patientSaving || deletingPatient}
                className="flex-1 bg-teal-600 text-white hover:bg-teal-500"
              >
                {patientSaving ? 'Guardando...' : editingPatientId ? 'Guardar cambios' : 'Guardar paciente'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={!!snackbar.open}
        message={snackbar.message || ''}
        actionLabel="Deshacer"
        onAction={handleUndo}
        onClose={() => setSnackbar({ open: false })}
      />
    </div>
  )
}

export default DashboardPage
