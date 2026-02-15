import { format, formatDistanceToNow, parseISO, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Calendar as CalendarIcon, ClipboardPlus, FlaskConical, Stethoscope, UserRound, Clock, CalendarCheck, Archive } from 'lucide-react'
import { Filtros } from '@/components/Filtros'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'En laboratorio':
      return <FlaskConical className="h-3.5 w-3.5" />
    case 'En clinica (sin citar)':
      return <Clock className="h-3.5 w-3.5" />
    case 'En clinica (citado)':
      return <CalendarCheck className="h-3.5 w-3.5" />
    case 'Cerrado':
      return <Archive className="h-3.5 w-3.5" />
    default:
      return null
  }
}

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
  const [section, setSection] = useState<'trabajos' | 'laboratorios' | 'especialistas' | 'pacientes'>('trabajos')
  const { jobs, labs, specialists, patients, loading, error, addJob, reload } = useJobs()

  useEffect(() => {
    window.setDashboardSection = setSection
    return () => {
      if (window.setDashboardSection === setSection) {
        window.setDashboardSection = undefined
      }
    }
  }, [setSection])

  useEffect(() => {
    getClinicForUser()
      .then((clinic) => {
        if (clinic?.name) {
          window.clinicName = clinic.name
          window.dispatchEvent(new Event('clinicNameChanged'))
        }
      })
      .catch(() => {
        // ignore
      })
  }, [])

  const defaultFilters = {
    paciente: '',
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
  const [saving, setSaving] = useState(false)
  const [deletingJob, setDeletingJob] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  // patient select local state
  const [patientQuery, setPatientQuery] = useState('')
  const [pendingPatientSelection, setPendingPatientSelection] = useState(false)

  useEffect(() => {
    if (open) setPatientQuery('')
  }, [open])

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

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.paciente.trim()) count += 1
    if (filters.laboratorioId !== 'all') count += 1
    if (filters.estado !== 'all') count += 1
    if (filters.maxDaysElapsed && filters.maxDaysElapsed > 0) count += 1
    return count
  }, [filters])

  const jobsForElapsed = useMemo(() => {
    return jobs.filter((job) => {
      const patient = patients.find((p) => p.id === job.patient_id)
      const matchPaciente = filters.paciente
        ? (patient?.name?.toLowerCase() || '').includes(filters.paciente.toLowerCase())
        : true
      const matchLab = filters.laboratorioId !== 'all' ? job.laboratory_id === filters.laboratorioId : true
      // Mostrar por defecto TODOS los estados excepto 'Cerrado'.
      // Si el usuario selecciona explícitamente un estado (p. ej. 'Cerrado'), mostrar solo ese estado.
      const matchEstado = filters.estado !== 'all' ? job.status === filters.estado : job.status !== 'Cerrado'

      return matchPaciente && matchLab && matchEstado
    })
  }, [jobs, filters, patients])

  const filteredJobs = useMemo(() => {
    let filtered = jobsForElapsed.filter((job) => {
      const matchDays = typeof filters.maxDaysElapsed === 'number' && filters.maxDaysElapsed > 0
        ? (job.order_date ? differenceInCalendarDays(new Date(), parseISO(job.order_date)) >= filters.maxDaysElapsed : false)
        : true

      return matchDays
    })

    const getLabName = (id: string | null) => labs.find((lab) => lab.id === id)?.name || ''
    const getSpecName = (id: string | null) => specialists.find((spec) => spec.id === id)?.name || ''

    filtered = filtered.slice().sort((a, b) => {
      const getPatientName = (id: string | null) => patients.find((p) => p.id === id)?.name || ''
      const compare = (x: string, y: string) => x.localeCompare(y)
      let cmp = 0
      switch (filters.sortBy) {
        case 'paciente':
          cmp = compare(getPatientName(a.patient_id), getPatientName(b.patient_id))
          break
        case 'trabajo':
          cmp = compare(a.job_description || '', b.job_description || '')
          break
        case 'laboratorio':
          cmp = compare(getLabName(a.laboratory_id), getLabName(b.laboratory_id))
          break
        case 'especialista':
          cmp = compare(getSpecName(a.specialist_id), getSpecName(b.specialist_id))
          break
        case 'estado':
          cmp = compare(a.status, b.status)
          break
        default:
          cmp = 0
      }
      return filters.sortDir === 'asc' ? cmp : -cmp
    })

    return filtered
  }, [filters, jobsForElapsed, labs, specialists, patients])

  const capitalizeFirst = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

  const maxElapsedDays = useMemo(() => {
    const values = jobsForElapsed
      .map((j) => (j.order_date ? differenceInCalendarDays(new Date(), parseISO(j.order_date)) : -1))
      .filter((d) => d >= 0)
    return values.length ? Math.max(...values) : 0
  }, [jobsForElapsed])

  const sliderMax = maxElapsedDays > 0 ? maxElapsedDays : 365
  const isElapsedDisabled = jobsForElapsed.length === 0

  // if available max shrinks, clamp the current filter value so the slider/value stay consistent
  useEffect(() => {
    if (filters.maxDaysElapsed > 0 && maxElapsedDays > 0 && filters.maxDaysElapsed > maxElapsedDays) {
      setFilters((prev) => ({ ...prev, maxDaysElapsed: maxElapsedDays }))
    }
  }, [filters.maxDaysElapsed, maxElapsedDays])

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
      if (pendingPatientSelection && saved?.id) {
        setForm((prev) => ({ ...prev, patient_id: saved.id }))
        setPendingPatientSelection(false)
      }

      setPatientOpen(false)
      setEditingPatientId(null)
      setPatientForm({ name: '', phone: '', email: '', code: '' })
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
      <>
        <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-teal-600 text-white hover:bg-teal-500"
                onClick={() => {
                  setEditingJobId(null)
                  setForm(getEmptyJobForm())
                  setOrderDateInteracted(false)
                }}
              >
                <ClipboardPlus className="mr-2 h-4 w-4" /> Nuevo trabajo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingJobId ? 'Editar trabajo' : 'Nuevo trabajo'}</DialogTitle>
                <DialogDescription>
                  Completa la información del {editingJobId ? 'trabajo' : 'nuevo trabajo'}
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={async (event) => {
                  event.preventDefault()
                  await handleSaveJob()
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={form.patient_id}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, patient_id: value }))}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-3 w-full">
                          <span className="w-10 text-right text-xs text-slate-500">{patients.find((p) => p.id === form.patient_id)?.code || '-'}</span>
                          <span className="flex-1 truncate text-sm text-slate-700">
                            {form.patient_id ? patients.find((p) => p.id === form.patient_id)?.name : 'Selecciona un paciente'}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="!p-0">
                        <div className="p-2">
                          <Input
                            value={patientQuery}
                            onChange={(e) => setPatientQuery(e.target.value)}
                            placeholder="Buscar paciente"
                            className="mb-2"
                          />
                        </div>
                        {patients
                          .filter((p) => p.name.toLowerCase().includes(patientQuery.toLowerCase()))
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id} className="pl-1">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span className="w-10 text-right text-xs text-slate-500">{p.code || '-'}</span>
                                  <span className="truncate">{p.name}</span>
                                </div>
                                <small className="text-xs text-slate-400">{p.phone || ''}</small>
                              </div>
                            </SelectItem>
                          ))}
                        {patients.filter((p) => p.name.toLowerCase().includes(patientQuery.toLowerCase())).length === 0 && (
                          <div className="p-3 text-sm text-slate-500">No hay resultados</div>
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPatientOpen(true)
                        setPendingPatientSelection(true)
                      }}
                    >
                      Nuevo
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Trabajo</Label>
                  <Input
                    value={form.job_description}
                    onChange={(event) => setForm((prev) => ({ ...prev, job_description: event.target.value }))}
                    placeholder="Nombre del trabajo"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Laboratorio</Label>
                    <Select
                      value={form.laboratory_id}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, laboratory_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {labs.map((lab) => (
                          <SelectItem key={lab.id} value={lab.id}>
                            {lab.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Especialista</Label>
                    <Select
                      value={form.specialist_id}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, specialist_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialists.map((spec) => (
                          <SelectItem key={spec.id} value={spec.id}>
                            {spec.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as JobStatus }))}
                  >
                    <SelectTrigger className={getStatusTextClass(form.status)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                  <div className="text-sm font-semibold text-slate-700">Salida trabajo</div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.order_date ? format(form.order_date, 'dd/MM/yyyy', { locale: es }) : <span>Selecciona una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.order_date}
                        onSelect={(value) => {
                          setForm((prev) => ({
                            ...prev,
                            order_date: value ?? prev.order_date ?? new Date(),
                          }))
                          setOrderDateInteracted(true)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {formError && <p className="text-sm text-rose-600">{formError}</p>}
                <div className="flex gap-4">
                  {editingJobId && (
                    <Button
                      type="button"
                      variant="destructive"
                      className="flex-1"
                      disabled={deletingJob || saving}
                      onClick={handleDeleteJob}
                    >
                      {deletingJob ? 'Eliminando...' : 'Eliminar trabajo'}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1 bg-teal-600 text-white hover:bg-teal-500"
                    disabled={saving || deletingJob}
                  >
                    {saving ? 'Guardando...' : editingJobId ? 'Guardar cambios' : 'Guardar trabajo'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Card className="mt-8 border-slate-200 bg-white/80 p-5">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <Input
                value={filters.paciente}
                onChange={(event) => setFilters((prev) => ({ ...prev, paciente: event.target.value }))}
                placeholder="Buscar por nombre"
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
        </Card>
        <Card className="mt-6 border-slate-200 bg-white">
          <Table>
            <colgroup>
              <col style={{ width: '22%' }} />
              <col style={{ width: '28%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '6%' }} />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer pl-6" style={{ minWidth: 120 }} onClick={() => {
                  setFilters((f) => ({
                    ...f,
                    sortBy: 'paciente',
                    sortDir: f.sortBy === 'paciente' ? (f.sortDir === 'asc' ? 'desc' : 'asc') : 'asc',
                  }))
                }}>
                  Paciente {filters.sortBy === 'paciente' ? (filters.sortDir === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead className="cursor-pointer" style={{ minWidth: 140 }} onClick={() => {
                  setFilters((f) => ({
                    ...f,
                    sortBy: 'trabajo',
                    sortDir: f.sortBy === 'trabajo' ? (f.sortDir === 'asc' ? 'desc' : 'asc') : 'asc',
                  }))
                }}>
                  Trabajo {filters.sortBy === 'trabajo' ? (filters.sortDir === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead className="cursor-pointer" style={{ minWidth: 140 }} onClick={() => {
                  setFilters((f) => ({
                    ...f,
                    sortBy: 'laboratorio',
                    sortDir: f.sortBy === 'laboratorio' ? (f.sortDir === 'asc' ? 'desc' : 'asc') : 'asc',
                  }))
                }}>
                  Laboratorio {filters.sortBy === 'laboratorio' ? (filters.sortDir === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead className="cursor-pointer" style={{ minWidth: 140 }} onClick={() => {
                  setFilters((f) => ({
                    ...f,
                    sortBy: 'especialista',
                    sortDir: f.sortBy === 'especialista' ? (f.sortDir === 'asc' ? 'desc' : 'asc') : 'asc',
                  }))
                }}>
                  Especialista {filters.sortBy === 'especialista' ? (filters.sortDir === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead className="cursor-pointer" style={{ minWidth: 100 }} onClick={() => {
                  setFilters((f) => ({
                    ...f,
                    sortBy: 'estado',
                    sortDir: f.sortBy === 'estado' ? (f.sortDir === 'asc' ? 'desc' : 'asc') : 'asc',
                  }))
                }}>
                  Estado {filters.sortBy === 'estado' ? (filters.sortDir === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead style={{ minWidth: 120 }}>Salida trabajo</TableHead>
                <TableHead style={{ minWidth: 120 }}>Transcurrido</TableHead>
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
                filteredJobs.map((job) => {
                  return (
                    <TableRow
                      key={job.id}
                      onClick={() => {
                        setEditingJobId(job.id)
                        setForm({
                          patient_id: job.patient_id || '',
                          job_description: job.job_description || '',
                          laboratory_id: job.laboratory_id || '',
                          specialist_id: job.specialist_id || '',
                          order_date: job.order_date ? parseISO(job.order_date) : new Date(),
                          status: job.status,
                        })
                        setOrderDateInteracted(true)
                        setOpen(true)
                      }}
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      <TableCell className="font-medium pl-6">
                        <div className="flex items-center gap-3">
                          <span className="w-10 text-right text-xs text-slate-500">{patients.find((p) => p.id === job.patient_id)?.code || '-'}</span>
                          <span>{patients.find((p) => p.id === job.patient_id)?.name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{job.job_description || 'Sin descripcion'}</TableCell>
                      <TableCell>{labs.find((lab) => lab.id === job.laboratory_id)?.name || '-'}</TableCell>
                      <TableCell>{specialists.find((spec) => spec.id === job.specialist_id)?.name || '-'}</TableCell>
                      <TableCell>
                        <span
                          className={
                            job.status === 'En laboratorio'
                              ? 'inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700'
                              : job.status === 'En clinica (sin citar)'
                                ? 'inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800'
                                : job.status === 'En clinica (citado)'
                                  ? 'inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700'
                                  : job.status === 'Cerrado'
                                    ? 'inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700'
                                    : 'inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700'
                          }
                        >
                          {job.status === 'En laboratorio' && <FlaskConical className="h-3 w-3" />}
                          {job.status === 'En clinica (sin citar)' && <Clock className="h-3 w-3" />}
                          {job.status === 'En clinica (citado)' && <CalendarCheck className="h-3 w-3" />}
                          {job.status === 'Cerrado' && <Archive className="h-3 w-3" />}
                          {job.status}
                        </span>
                      </TableCell>
                      <TableCell>{job.order_date ? format(parseISO(job.order_date), 'dd/MM/yyyy', { locale: es }) : '-'}</TableCell>
                      <TableCell>
                        {job.order_date ? capitalizeFirst(formatDistanceToNow(parseISO(job.order_date), { locale: es, addSuffix: true })) : '-'}
                      </TableCell>
                    </TableRow>
                  )
                }
                )}
            </TableBody>
          </Table>
        </Card>
      </>
    )
  } else if (section === 'laboratorios') {
    sectionContent = (
      <>
        <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
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
            <DialogTrigger asChild>
              <Button className="bg-teal-600 text-white hover:bg-teal-500">
                <FlaskConical className="mr-2 h-4 w-4" /> {editingLabId ? 'Editar laboratorio' : 'Nuevo laboratorio'}
              </Button>
            </DialogTrigger>
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
          filters={labsFilters}
          setFilters={setLabsFilters}
          showPaciente={true}
          showLaboratorio={false}
          showEstado={false}
        />
        <LaboratoriesTable
          labs={labs}
          filter={labsFilters.paciente ?? ''}
          onEdit={(lab) => {
            setEditingLabId(lab.id)
            setLabForm({ name: lab.name, phone: lab.phone || '', email: lab.email || '' })
            setLabOpen(true)
          }}
        />
      </>
    )
  } else if (section === 'especialistas') {
    sectionContent = (
      <>
        <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
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
            <DialogTrigger asChild>
              <Button className="bg-teal-600 text-white hover:bg-teal-500">
                <Stethoscope className="mr-2 h-4 w-4" /> {editingSpecId ? 'Editar especialista' : 'Nuevo especialista'}
              </Button>
            </DialogTrigger>
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
          filters={specialistsFilters}
          setFilters={setSpecialistsFilters}
          showPaciente={true}
          showLaboratorio={false}
          showEstado={false}
        />
        <SpecialistsTable
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
      </>
    )
  } else if (section === 'pacientes') {
    sectionContent = (
      <>
        <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
          <Dialog
            open={patientOpen}
            onOpenChange={(value) => {
              setPatientOpen(value)
              if (!value) {
                setEditingPatientId(null)
                setPatientForm({ name: '', phone: '', email: '', code: '' })
                setPendingPatientSelection(false)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-teal-600 text-white hover:bg-teal-500">
                <UserRound className="mr-2 h-4 w-4" /> {editingPatientId ? 'Editar paciente' : 'Nuevo paciente'}
              </Button>
            </DialogTrigger>
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
                  <Label>Codigo</Label>
                  <Input
                    value={patientForm.code}
                    onChange={(event) => setPatientForm((prev) => ({ ...prev, code: event.target.value }))}
                    placeholder="Codigo del paciente"
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
                  <Label>Movil</Label>
                  <Input
                    value={patientForm.phone}
                    onChange={(event) => setPatientForm((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="Telefono del paciente"
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
        </div>

        <Filtros
          filters={patientsFilters}
          setFilters={setPatientsFilters}
          showPaciente={true}
          showLaboratorio={false}
          showEstado={false}
        />
        <PatientsTable
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
      </>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full px-6 py-10">{sectionContent}</div>
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
