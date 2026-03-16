import { format, formatDistanceToNow, parseISO, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { forwardRef, useCallback, useDeferredValue, useEffect, useImperativeHandle, useMemo, useRef, useState, startTransition, type ReactNode } from 'react'
import { formatFullName, normalizeSearch, cn } from '@/lib/utils'
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
import type { Job, JobStatus, Laboratory, NewJob, Specialist, Patient } from '@/types/domain'
import { LaboratoriesTable, PatientsTable, SpecialistsTable } from './LaboratoriesSpecialistsTables'
import ClinicSettings from '@/pages/ClinicSettings'

const STATUSES: JobStatus[] = [
  'En laboratorio',
  'En clínica (sin citar)',
  'En clínica (citado)',
  'Cerrado',
]

const getStatusTextClass = (status?: string) => {
  switch (status) {
    case 'En laboratorio':
      return 'text-yellow-600'
    case 'En clínica (sin citar)':
      return 'text-orange-700'
    case 'En clínica (citado)':
      return 'text-purple-600'
    case 'Cerrado':
      return 'text-blue-600'
    default:
      return ''
  }
}

const getStatusBgClass = (status?: string) => {
  switch (status) {
    case 'En laboratorio':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    case 'En clínica (sin citar)':
      return 'bg-orange-50 text-orange-800 border-orange-200'
    case 'En clínica (citado)':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'Cerrado':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    default:
      return ''
  }
}

const getStatusPillClass = (status?: string) => {
  // versión compacta del badge para la tabla (menor padding y altura)
  switch (status) {
    case 'En laboratorio':
      return 'w-[186px] flex items-center justify-between gap-2 h-7 rounded-full bg-yellow-50 px-3 py-0.5 text-xs font-medium text-yellow-700'
    case 'En clínica (sin citar)':
      return 'w-[186px] flex items-center justify-between gap-2 h-7 rounded-full bg-orange-100 px-3 py-0.5 text-xs font-medium text-orange-800'
    case 'En clínica (citado)':
      return 'w-[186px] flex items-center justify-between gap-2 h-7 rounded-full bg-purple-50 px-3 py-0.5 text-xs font-medium text-purple-700'
    case 'Cerrado':
      return 'w-[186px] flex items-center justify-between gap-2 h-7 rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-700'
    default:
      return 'w-[186px] flex items-center justify-between gap-2 h-7 rounded-full bg-teal-50 px-3 py-0.5 text-xs font-medium text-teal-700'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'En laboratorio':
      return <FlaskConical className="h-3.5 w-3.5 shrink-0" />
    case 'En clínica (sin citar)':
      return <Clock className="h-3.5 w-3.5 shrink-0" />
    case 'En clínica (citado)':
      return <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
    case 'Cerrado':
      return <Archive className="h-3.5 w-3.5 shrink-0" />
    default:
      return null
  }
}

const capitalizeFirst = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

const getEmptyPatientForm = () => ({ name: '', lastname: '', dni: '', phone: '', email: '', code: '' })

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

type JobSortBy = 'paciente' | 'trabajo' | 'laboratorio' | 'especialista' | 'estado' | 'fecha' | 'transcurrido'

type JobFilters = {
  trabajo: string
  laboratorioId: string
  estado: string
  sortBy: JobSortBy
  sortDir: 'asc' | 'desc'
  maxDaysElapsed: number
}

const DEFAULT_JOB_FILTERS: JobFilters = {
  trabajo: '',
  laboratorioId: 'all',
  estado: 'all',
  sortBy: 'paciente',
  sortDir: 'asc',
  maxDaysElapsed: 0,
}

const textCollator = new Intl.Collator('es-ES', { sensitivity: 'base', numeric: true })

const compareText = (left?: string | null, right?: string | null) => textCollator.compare(left ?? '', right ?? '')

const getEmptyJobForm = (): JobForm => ({
  patient_id: '',
  job_description: '',
  laboratory_id: '',
  specialist_id: '',
  order_date: new Date(),
  status: STATUSES[0],
})

// ─── LabDialog ────────────────────────────────────────────────────────────────
type LabFormState = { name: string; phone: string; email: string }
interface LabDialogProps {
  open: boolean
  editingLabId: string | null
  initialValues: LabFormState
  pendingJobModal: boolean
  onSaved: (lab: Laboratory, reopenJobModal: boolean) => void
  onDeleted: (lab: Laboratory) => void
  onClose: (wasPending: boolean) => void
}
function LabDialog({ open, editingLabId, initialValues, pendingJobModal, onSaved, onDeleted, onClose }: LabDialogProps) {
  const [form, setForm] = useState<LabFormState>(initialValues)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) { setForm(initialValues); setError(null) }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      if (!form.name.trim()) throw new Error('El nombre del laboratorio es obligatorio')
      const saved = editingLabId
        ? await updateLaboratory(editingLabId, { name: form.name.trim(), phone: form.phone || null, email: form.email || null })
        : await createLaboratory({ name: form.name.trim(), phone: form.phone || null, email: form.email || null })
      onSaved(saved, pendingJobModal)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!editingLabId) return
    setDeleting(true); setError(null)
    try {
      const deleted = await deleteLaboratory(editingLabId)
      onDeleted(deleted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar')
    } finally { setDeleting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(pendingJobModal) }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingLabId ? 'Editar laboratorio' : 'Nuevo laboratorio'}</DialogTitle>
          <DialogDescription>Completa la información del {editingLabId ? 'laboratorio' : 'nuevo laboratorio'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={async (e) => { e.preventDefault(); await handleSave() }} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nombre del laboratorio" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Móvil</Label>
              <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Teléfono de contacto" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email del laboratorio" />
            </div>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-4">
            {editingLabId && (
              <Button type="button" variant="destructive" className="flex-1" disabled={saving || deleting} onClick={handleDelete}>
                {deleting ? 'Eliminando...' : 'Eliminar laboratorio'}
              </Button>
            )}
            <Button type="submit" disabled={saving || deleting} className="flex-1 bg-teal-600 text-white hover:bg-teal-500">
              {saving ? 'Guardando...' : editingLabId ? 'Guardar cambios' : 'Guardar laboratorio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── SpecDialog ───────────────────────────────────────────────────────────────
type SpecFormState = { name: string; specialty: string; phone: string; email: string }
interface SpecDialogProps {
  open: boolean
  editingSpecId: string | null
  initialValues: SpecFormState
  pendingJobModal: boolean
  onSaved: (spec: Specialist, reopenJobModal: boolean) => void
  onDeleted: (spec: Specialist) => void
  onClose: (wasPending: boolean) => void
}
function SpecDialog({ open, editingSpecId, initialValues, pendingJobModal, onSaved, onDeleted, onClose }: SpecDialogProps) {
  const [form, setForm] = useState<SpecFormState>(initialValues)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) { setForm(initialValues); setError(null) }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      if (!form.name.trim()) throw new Error('El nombre del especialista es obligatorio')
      const saved = editingSpecId
        ? await updateSpecialist(editingSpecId, { name: form.name.trim(), specialty: form.specialty || null, phone: form.phone || null, email: form.email || null })
        : await createSpecialist({ name: form.name.trim(), specialty: form.specialty || null, phone: form.phone || null, email: form.email || null })
      onSaved(saved, pendingJobModal)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!editingSpecId) return
    setDeleting(true); setError(null)
    try {
      const deleted = await deleteSpecialist(editingSpecId)
      onDeleted(deleted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar')
    } finally { setDeleting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(pendingJobModal) }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingSpecId ? 'Editar especialista' : 'Nuevo especialista'}</DialogTitle>
          <DialogDescription>Completa la información del {editingSpecId ? 'especialista' : 'nuevo especialista'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={async (e) => { e.preventDefault(); await handleSave() }} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nombre del especialista" />
          </div>
          <div className="space-y-2">
            <Label>Especialidad</Label>
            <Input value={form.specialty} onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))} placeholder="Especialidad" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Móvil</Label>
              <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Teléfono de contacto" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email del especialista" />
            </div>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-4">
            {editingSpecId && (
              <Button type="button" variant="destructive" className="flex-1" disabled={saving || deleting} onClick={handleDelete}>
                {deleting ? 'Eliminando...' : 'Eliminar especialista'}
              </Button>
            )}
            <Button type="submit" disabled={saving || deleting} className="flex-1 bg-teal-600 text-white hover:bg-teal-500">
              {saving ? 'Guardando...' : editingSpecId ? 'Guardar cambios' : 'Guardar especialista'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── PatientDialog ────────────────────────────────────────────────────────────
type PatientFormState = { name: string; lastname: string; dni: string; phone: string; email: string; code: string }
interface PatientDialogProps {
  open: boolean
  editingPatientId: string | null
  initialValues: PatientFormState
  pendingJobModal: boolean
  onSaved: (patient: Patient, reopenJobModal: boolean) => void
  onDeleted: (patient: Patient) => void
  onClose: (wasPending: boolean) => void
}
function PatientDialog({ open, editingPatientId, initialValues, pendingJobModal, onSaved, onDeleted, onClose }: PatientDialogProps) {
  const [form, setForm] = useState<PatientFormState>(initialValues)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) { setForm(initialValues); setError(null) }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      if (!form.name.trim()) throw new Error('El nombre del paciente es obligatorio')
      const saved = editingPatientId
        ? await updatePatient(editingPatientId, { name: form.name.trim(), lastname: form.lastname.trim() || null, dni: form.dni.trim() || null, phone: form.phone || null, email: form.email || null, code: form.code || null })
        : await createPatient({ name: form.name.trim(), lastname: form.lastname.trim() || null, dni: form.dni.trim() || null, phone: form.phone || null, email: form.email || null, code: form.code || null })
      onSaved(saved, pendingJobModal)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!editingPatientId) return
    setDeleting(true); setError(null)
    try {
      const deleted = await deletePatient(editingPatientId)
      onDeleted(deleted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar')
    } finally { setDeleting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(pendingJobModal) }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingPatientId ? 'Editar paciente' : 'Nuevo paciente'}</DialogTitle>
          <DialogDescription>Completa la informacion del {editingPatientId ? 'paciente' : 'nuevo paciente'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={async (e) => { e.preventDefault(); await handleSave() }} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Código</Label>
              <Input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="Código del paciente" />
            </div>
            <div className="space-y-2">
              <Label>DNI</Label>
              <Input value={form.dni} onChange={(e) => setForm((p) => ({ ...p, dni: e.target.value }))} placeholder="DNI del paciente" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nombre del paciente" />
            </div>
            <div className="space-y-2">
              <Label>Apellidos</Label>
              <Input value={form.lastname} onChange={(e) => setForm((p) => ({ ...p, lastname: e.target.value }))} placeholder="Apellidos del paciente" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Móvil</Label>
              <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Teléfono del paciente" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email del paciente" />
            </div>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-4">
            {editingPatientId && (
              <Button type="button" variant="destructive" className="flex-1" disabled={saving || deleting} onClick={handleDelete}>
                {deleting ? 'Eliminando...' : 'Eliminar paciente'}
              </Button>
            )}
            <Button type="submit" disabled={saving || deleting} className="flex-1 bg-teal-600 text-white hover:bg-teal-500">
              {saving ? 'Guardando...' : editingPatientId ? 'Guardar cambios' : 'Guardar paciente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── JobDialog ────────────────────────────────────────────────────────────────
type JobDialogHandle = { patchForm: (patch: Partial<JobForm>) => void }
interface JobDialogProps {
  open: boolean
  editingJob: Job | null
  patients: Patient[]
  patientsById: Record<string, Patient>
  labs: Laboratory[]
  specialists: Specialist[]
  addJob: (data: Omit<NewJob, 'clinic_id'>) => Promise<Job>
  onOpenChange: (open: boolean) => void
  onSaved: (job: Job, isNew: boolean) => void
  onDeleted: (job: Job) => void
  onNewLab: () => void
  onNewSpec: () => void
  onNewPatient: () => void
}
const JobDialog = forwardRef<JobDialogHandle, JobDialogProps>(function JobDialog(
  { open, editingJob, patients, patientsById, labs, specialists, addJob, onOpenChange, onSaved, onDeleted, onNewLab, onNewSpec, onNewPatient },
  ref,
) {
  const [form, setForm] = useState<JobForm>(getEmptyJobForm)
  const [orderDateInteracted, setOrderDateInteracted] = useState(false)
  const [orderDatePopoverOpen, setOrderDatePopoverOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [patientQuery, setPatientQuery] = useState('')

  useImperativeHandle(ref, () => ({
    patchForm: (patch) => setForm((prev) => ({ ...prev, ...patch })),
  }))

  useEffect(() => {
    if (open) {
      if (editingJob) {
        setForm({
          patient_id: editingJob.patient_id || '',
          job_description: editingJob.job_description || '',
          laboratory_id: editingJob.laboratory_id || '',
          specialist_id: editingJob.specialist_id || '',
          order_date: editingJob.order_date ? parseISO(editingJob.order_date) : new Date(),
          status: editingJob.status,
        })
        setOrderDateInteracted(true)
      } else {
        setForm(getEmptyJobForm())
        setOrderDateInteracted(false)
      }
      setError(null)
      setPatientQuery('')
    }
  }, [open, editingJob?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const normalizedPatientQuery = useMemo(() => normalizeSearch(patientQuery), [patientQuery])

  const patientSearchIndex = useMemo(
    () => patients.map((p) => ({
      patient: p,
      searchText: normalizeSearch([p.name, p.lastname, p.code, p.dni].filter(Boolean).join(' ')),
    })),
    [patients],
  )

  const filteredPatients = useMemo(() => {
    if (!normalizedPatientQuery) return patients
    return patientSearchIndex
      .filter(({ searchText }) => searchText.includes(normalizedPatientQuery))
      .map(({ patient }) => patient)
  }, [normalizedPatientQuery, patientSearchIndex, patients])

  const PatientPreview = useCallback(({ patientId, placeholder = 'Seleccionar paciente', inset = false }: { patientId?: string; placeholder?: string; inset?: boolean }) => {
    const p = patientId ? patientsById[patientId] : undefined
    const gapClass = inset ? 'gap-2' : 'gap-1'
    const codeWidthClass = inset ? 'w-12 flex-none truncate whitespace-nowrap overflow-hidden' : 'min-w-[2rem]'
    return (
      <div className={`flex items-center ${gapClass} w-full justify-start ${inset ? 'pl-2' : ''}`}>
        {patientId ? (
          <span title={p?.code ?? undefined} className={`${codeWidthClass} text-left text-xs text-slate-500`}>{p?.code ?? ''}</span>
        ) : null}
        <span className={(patientId ? 'text-slate-700 ' : 'text-slate-500 ') + 'flex-1 truncate text-sm text-left'}>
          {p ? formatFullName(p.name, p.lastname) : placeholder}
        </span>
      </div>
    )
  }, [patientsById])

  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      if (!form.patient_id) throw new Error('Selecciona un paciente')
      const orderDateValue: string | null = !editingJob && !orderDateInteracted
        ? new Date().toISOString()
        : form.order_date
          ? format(form.order_date, 'yyyy-MM-dd')
          : null
      const payload: Omit<NewJob, 'clinic_id'> = {
        patient_id: form.patient_id,
        job_description: form.job_description || null,
        laboratory_id: form.laboratory_id || null,
        specialist_id: form.specialist_id || null,
        order_date: orderDateValue,
        status: form.status,
      }
      if (editingJob) {
        const updated = await updateJob(editingJob.id, payload)
        onSaved(updated, false)
      } else {
        const created = await addJob(payload)
        onSaved(created, true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!editingJob) return
    setDeleting(true); setError(null)
    try {
      const deleted = await deleteJob(editingJob.id)
      onDeleted(deleted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar')
    } finally { setDeleting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingJob ? 'Editar trabajo' : 'Nuevo trabajo'}</DialogTitle>
          <DialogDescription>Completa la información del trabajo y guarda los cambios.</DialogDescription>
        </DialogHeader>
        <form onSubmit={async (e) => { e.preventDefault(); await handleSave() }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select
                value={form.patient_id}
                onValueChange={(value) => {
                  if (value === '__new') { onNewPatient(); return }
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
                placeholder="Descripción del trabajo"
              />
            </div>

            <div className="space-y-2">
              <Label>Laboratorio</Label>
              <Select
                value={form.laboratory_id || ''}
                onValueChange={(v) => {
                  if (v === '__new') { onNewLab(); return }
                  setForm((prev) => ({ ...prev, laboratory_id: v === '__none' ? '' : v }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin laboratorio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Sin laboratorio</SelectItem>
                  {labs.map((lab) => (
                    <SelectItem key={lab.id} value={lab.id}>{lab.name}</SelectItem>
                  ))}
                  <SelectSeparator />
                  <SelectItem value="__new">+ Nuevo laboratorio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Especialista</Label>
              <Select
                value={form.specialist_id || ''}
                onValueChange={(v) => {
                  if (v === '__new') { onNewSpec(); return }
                  setForm((prev) => ({ ...prev, specialist_id: v === '__none' ? '' : v }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin especialista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Sin especialista</SelectItem>
                  {specialists.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                  <SelectSeparator />
                  <SelectItem value="__new">+ Nuevo especialista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Salida trabajo</Label>
              <Popover open={orderDatePopoverOpen} onOpenChange={setOrderDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-sm font-normal !bg-white !text-slate-900 !border-slate-300 ring-1 ring-slate-200 shadow-xs hover:!bg-white hover:text-slate-900">
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
                <SelectTrigger className={cn("w-full transition-colors", form.status ? getStatusBgClass(form.status) : '')}>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((st) => (
                    <SelectItem key={st} value={st} className={getStatusTextClass(st)}>
                      <span className={cn("flex items-center gap-2", getStatusTextClass(st))}>
                        {getStatusIcon(st)}
                        {st}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex gap-4">
            {editingJob && (
              <Button type="button" variant="destructive" className="flex-1" disabled={saving || deleting} onClick={handleDelete}>
                {deleting ? 'Eliminando...' : 'Eliminar trabajo'}
              </Button>
            )}
            <Button type="submit" disabled={saving || deleting} className="flex-1 bg-teal-600 text-white hover:bg-teal-500">
              {saving ? 'Guardando...' : editingJob ? 'Guardar cambios' : 'Guardar trabajo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
})

function DashboardPage() {
  const [section, setSection] = useState<'trabajos' | 'laboratorios' | 'especialistas' | 'pacientes' | 'ajustes'>('trabajos')
  const {
    jobs,
    labs,
    specialists,
    patients,
    loading,
    error,
    addJob,
    reload,
    updateLocalJobStatus,
    upsertLocalJob,
    removeLocalJob,
    upsertLocalLaboratory,
    upsertLocalSpecialist,
    upsertLocalPatient,
  } = useJobs()

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

  const [filters, setFilters] = useState<JobFilters>(DEFAULT_JOB_FILTERS)
  const [labsFilters, setLabsFilters] = useState<BasicFilters>({ paciente: '' })
  const [specialistsFilters, setSpecialistsFilters] = useState<BasicFilters>({ paciente: '' })
  const [patientsFilters, setPatientsFilters] = useState<BasicFilters>({ paciente: '' })

  const setJobFilters = (updater: React.SetStateAction<JobFilters>) => {
    startTransition(() => setFilters(updater))
  }

  const [open, setOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const jobDialogRef = useRef<JobDialogHandle>(null)
  // patient select local state
  const [pendingLaboratorySelection, setPendingLaboratorySelection] = useState(false)
  const [pendingSpecialistSelection, setPendingSpecialistSelection] = useState(false)
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

  const [specOpen, setSpecOpen] = useState(false)
  const [editingSpecId, setEditingSpecId] = useState<string | null>(null)

  const [patientOpen, setPatientOpen] = useState(false)
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null)

  const [snackbar, setSnackbar] = useState<{ open: boolean; kind?: 'job' | 'lab' | 'spec' | 'patient'; item?: Job | Laboratory | Specialist | Patient | null; message?: string }>({ open: false })

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
  const weekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat('es-ES', { weekday: 'long' }),
    [],
  )
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat('es-ES', { month: 'long' }),
    [],
  )

  const jobRows = useMemo(() => {
    if (section !== 'trabajos') return []
    return jobs.map((job) => {
      const patient = job.patient_id ? patientsById[job.patient_id] : undefined
      const lab = job.laboratory_id ? labsById[job.laboratory_id] : undefined
      const labName = lab?.name || ''
      const labPhone = lab?.phone || ''
      const specName = job.specialist_id ? (specsById[job.specialist_id]?.name || '') : ''
      const jobDesc = job.job_description || ''
      const patientName = patient?.name || ''
      const patientFullName = formatFullName(patient?.name, patient?.lastname)
      const patientCode = patient?.code || ''
      const patientPhone = patient?.phone || ''
      const orderDateValue = job.order_date ? parseISO(job.order_date) : null
      const orderDateTimestamp = orderDateValue?.getTime() ?? 0
      const elapsedDays = orderDateValue ? differenceInCalendarDays(now, orderDateValue) : -1
      const waUrl = patientPhone
        ? `https://wa.me/${patientPhone}?text=${encodeURIComponent(`Hola ${patientName},\nYa tenemos el trabajo (${jobDesc}) disponible en clínica.\nPor favor, contáctanos para agendar una cita.\n¡Gracias!`)}`
        : ''
      const searchText = normalizeSearch([jobDesc, patientFullName, patientCode].filter(Boolean).join(' '))
      const orderDateText = orderDateValue ? formatter.format(orderDateValue) : '-'
      const elapsedText = orderDateValue
        ? capitalizeFirst(formatDistanceToNow(orderDateValue, { locale: es, addSuffix: true }).replace(/\balrededor(?: de)?\s*/i, ''))
        : '-'
      const labDateText = orderDateValue
        ? `${weekdayFormatter.format(orderDateValue)} ${orderDateValue.getDate()} de ${monthFormatter.format(orderDateValue)}`
        : ''
      const labWaUrl = `https://wa.me/${labPhone || ''}?text=${encodeURIComponent(`Hola${labName ? ` ${labName}` : ''},\nNos gustaría preguntar por el estado del trabajo que salió el ${labDateText}, del paciente ${patientFullName} (${jobDesc}).\nGracias y un saludo`)}`

      return {
        job,
        labName,
        labPhone,
        specName,
        patientName: patientFullName,
        patientCode,
        patientPhone,
        waUrl,
        searchText,
        orderDateTimestamp,
        elapsedDays,
        orderDateText,
        elapsedText,
        labWaUrl,
      }
    })
  }, [formatter, jobs, labsById, monthFormatter, now, patientsById, section, specsById, weekdayFormatter])

  const jobsAfterBaseFilters = useMemo(() => {
    if (section !== 'trabajos') return []
    return jobRows.filter(({ job, searchText }) => {
      const q = normalizedTrabajoQuery
      const matchQuery = q ? searchText.includes(q) : true
      const matchLab = filters.laboratorioId !== 'all' ? job.laboratory_id === filters.laboratorioId : true
      const matchEstado = filters.estado !== 'all' ? job.status === filters.estado : job.status !== 'Cerrado'

      return matchQuery && matchLab && matchEstado
    })
  }, [filters.estado, filters.laboratorioId, jobRows, normalizedTrabajoQuery, section])

  const maxElapsedDays = useMemo(() => {
    if (section !== 'trabajos') return 0
    const values = jobsAfterBaseFilters.map(({ elapsedDays }) => elapsedDays).filter((elapsedDays) => elapsedDays >= 0)
    return values.length ? Math.max(...values) : 0
  }, [jobsAfterBaseFilters, section])

  const filteredJobs = useMemo(() => {
    if (section !== 'trabajos') return []
    const minElapsedDays = typeof filters.maxDaysElapsed === 'number' ? filters.maxDaysElapsed : 0
    let filtered = minElapsedDays > 0
      ? jobsAfterBaseFilters.filter(({ elapsedDays }) => elapsedDays >= minElapsedDays)
      : jobsAfterBaseFilters

    filtered = filtered.slice().sort((a, b) => {
      let cmp = 0
      switch (filters.sortBy) {
        case 'paciente':
          cmp = compareText(a.patientName, b.patientName)
          break
        case 'trabajo':
          cmp = compareText(a.job.job_description, b.job.job_description)
          break
        case 'laboratorio':
          cmp = compareText(a.labName, b.labName)
          break
        case 'especialista':
          cmp = compareText(a.specName, b.specName)
          break
        case 'estado':
          cmp = compareText(a.job.status, b.job.status)
          break
        case 'fecha':
          cmp = a.orderDateTimestamp - b.orderDateTimestamp
          break
        case 'transcurrido':
          cmp = a.elapsedDays - b.elapsedDays
          break
        default:
          cmp = 0
      }
      return filters.sortDir === 'asc' ? cmp : -cmp
    })

    return filtered
  }, [filters.maxDaysElapsed, filters.sortBy, filters.sortDir, jobsAfterBaseFilters, section])

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

  const sliderMax = Math.max(0, maxElapsedDays)
  const isElapsedDisabled = section !== 'trabajos' || jobsAfterBaseFilters.length === 0

  useEffect(() => {
    if (filters.maxDaysElapsed > maxElapsedDays) {
      setFilters((prev) => ({ ...prev, maxDaysElapsed: maxElapsedDays }))
    }
  }, [filters.maxDaysElapsed, maxElapsedDays])

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
        await createPatient({ name: p.name, lastname: p.lastname || null, dni: p.dni || null, phone: p.phone || null, email: p.email || null, code: p.code || null })
        await reload()
        return
      }
    } catch {
      // ignore undo errors
    }
  }

  // ─── Job dialog callbacks ──────────────────────────────────────────────────
  const handleJobSaved = (job: Job, isNew: boolean) => {
    if (!isNew) upsertLocalJob(job)
    setOpen(false)
    setEditingJob(null)
  }

  const handleJobDeleted = (job: Job) => {
    removeLocalJob(job.id)
    setSnackbar({ open: true, kind: 'job', item: job, message: 'Trabajo eliminado' })
    setOpen(false)
    setEditingJob(null)
  }

  const handleJobOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) {
      setEditingJob(null)
    }
  }

  // ─── Lab dialog callbacks ──────────────────────────────────────────────────
  const handleLabSaved = (lab: Laboratory, reopenJobModal: boolean) => {
    upsertLocalLaboratory(lab)
    if (reopenJobModal && lab.id) {
      jobDialogRef.current?.patchForm({ laboratory_id: lab.id })
      setLabOpen(false)
      setEditingLabId(null)
      setPendingLaboratorySelection(false)
      setOpen(true)
    } else {
      setLabOpen(false)
      setEditingLabId(null)
    }
  }

  const handleLabDeleted = async (lab: Laboratory) => {
    setSnackbar({ open: true, kind: 'lab', item: lab, message: 'Laboratorio eliminado' })
    setLabOpen(false)
    setEditingLabId(null)
    await reload()
  }

  const handleLabClose = (wasPending: boolean) => {
    setEditingLabId(null)
    setPendingLaboratorySelection(false)
    setLabOpen(false)
    if (wasPending) setOpen(true)
  }

  // ─── Spec dialog callbacks ─────────────────────────────────────────────────
  const handleSpecSaved = (spec: Specialist, reopenJobModal: boolean) => {
    upsertLocalSpecialist(spec)
    if (reopenJobModal && spec.id) {
      jobDialogRef.current?.patchForm({ specialist_id: spec.id })
      setSpecOpen(false)
      setEditingSpecId(null)
      setPendingSpecialistSelection(false)
      setOpen(true)
    } else {
      setSpecOpen(false)
      setEditingSpecId(null)
    }
  }

  const handleSpecDeleted = async (spec: Specialist) => {
    setSnackbar({ open: true, kind: 'spec', item: spec, message: 'Especialista eliminado' })
    setSpecOpen(false)
    setEditingSpecId(null)
    await reload()
  }

  const handleSpecClose = (wasPending: boolean) => {
    setEditingSpecId(null)
    setPendingSpecialistSelection(false)
    setSpecOpen(false)
    if (wasPending) setOpen(true)
  }

  // ─── Patient dialog callbacks ──────────────────────────────────────────────
  const handlePatientSaved = (patient: Patient, reopenJobModal: boolean) => {
    upsertLocalPatient(patient)
    if (reopenJobModal && patient.id) {
      jobDialogRef.current?.patchForm({ patient_id: patient.id })
      setPatientOpen(false)
      setEditingPatientId(null)
      setPendingPatientSelection(false)
      setOpen(true)
    } else {
      setPatientOpen(false)
      setEditingPatientId(null)
    }
  }

  const handlePatientDeleted = async (patient: Patient) => {
    setSnackbar({ open: true, kind: 'patient', item: patient, message: 'Paciente eliminado' })
    setPatientOpen(false)
    setEditingPatientId(null)
    await reload()
  }

  const handlePatientClose = (wasPending: boolean) => {
    setEditingPatientId(null)
    setPendingPatientSelection(false)
    setPatientOpen(false)
    if (wasPending) setOpen(true)
  }

  let sectionContent: ReactNode = null
  if (section === 'trabajos') {
    sectionContent = (
      <Card className="border-slate-200 bg-white/80 p-3 md:p-5 mb-0 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4 mb-4">
          <div className="space-y-2 w-full md:w-auto md:flex-1">
            <Label>Buscar</Label>
            <Input
              value={filters.trabajo}
              onChange={(event) => setJobFilters((prev) => ({ ...prev, trabajo: event.target.value }))}
              placeholder="Buscar por paciente o trabajo"
            />
          </div>
          <div className="space-y-2 w-full md:w-auto md:flex-1">
            <Label>Estado</Label>
            <Select value={filters.estado} onValueChange={(value) => setJobFilters((prev) => ({ ...prev, estado: value }))}>
              <SelectTrigger className={cn("transition-colors", filters.estado !== 'all' ? getStatusTextClass(filters.estado) : '')}>
                <SelectValue placeholder="Todos">
                  {filters.estado !== 'all' ? (
                    <span className="flex items-center gap-2">
                      {getStatusIcon(filters.estado)}
                      {filters.estado}
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
          <div className="space-y-2 w-full md:w-auto md:flex-1">
            <Label>Laboratorio</Label>
            <Select
              value={filters.laboratorioId}
              onValueChange={(value) => setJobFilters((prev) => ({ ...prev, laboratorioId: value }))}
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
          <div className="space-y-2 w-full md:w-auto md:flex-1 relative pb-[10px]">
            <Label>Transcurrido (días)</Label>
            <div className="relative mt-4">
              <input
                type="range"
                min={0}
                max={sliderMax}
                step={1}
                value={filters.maxDaysElapsed ?? 0}
                onChange={(e) => setJobFilters((prev) => ({ ...prev, maxDaysElapsed: Number(e.target.value) }))}
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
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs hover:bg-rose-100 hover:text-rose-700 h-10 mb-[2px] w-full md:w-auto"
              onClick={() => setJobFilters({ ...DEFAULT_JOB_FILTERS })}
            >
              Restablecer
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                {activeFiltersCount}
              </span>
            </Button>
          )}
        </div>
        <div className="p-0 flex-1 min-h-0 overflow-auto">
          <Table className="min-w-[1200px] w-full table-fixed">
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => {
                    if (filters.sortBy === 'paciente') {
                      setJobFilters((prev) => ({ ...prev, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }))
                    } else {
                      setJobFilters((prev) => ({ ...prev, sortBy: 'paciente', sortDir: 'asc' }))
                    }
                  }}
                >
                  Paciente {filters.sortBy === 'paciente' ? (filters.sortDir === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => {
                    if (filters.sortBy === 'trabajo') {
                      setJobFilters((prev) => ({ ...prev, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }))
                    } else {
                      setJobFilters((prev) => ({ ...prev, sortBy: 'trabajo', sortDir: 'asc' }))
                    }
                  }}
                >
                  Trabajo {filters.sortBy === 'trabajo' ? (filters.sortDir === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead
                  className="cursor-pointer pr-6"
                  onClick={() => {
                    if (filters.sortBy === 'estado') {
                      setJobFilters((prev) => ({ ...prev, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }))
                    } else {
                      setJobFilters((prev) => ({ ...prev, sortBy: 'estado', sortDir: 'asc' }))
                    }
                  }}
                >
                  Estado {filters.sortBy === 'estado' ? (filters.sortDir === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead
                  className="cursor-pointer pl-6"
                  onClick={() => {
                    if (filters.sortBy === 'laboratorio') {
                      setJobFilters((prev) => ({ ...prev, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }))
                    } else {
                      setJobFilters((prev) => ({ ...prev, sortBy: 'laboratorio', sortDir: 'asc' }))
                    }
                  }}
                >
                  Laboratorio {filters.sortBy === 'laboratorio' ? (filters.sortDir === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => {
                    if (filters.sortBy === 'especialista') {
                      setJobFilters((prev) => ({ ...prev, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }))
                    } else {
                      setJobFilters((prev) => ({ ...prev, sortBy: 'especialista', sortDir: 'asc' }))
                    }
                  }}
                >
                  Especialista {filters.sortBy === 'especialista' ? (filters.sortDir === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead
                  className="pl-8 cursor-pointer"
                  onClick={() => {
                    if (filters.sortBy === 'fecha') {
                      setJobFilters((prev) => ({ ...prev, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }))
                    } else {
                      setJobFilters((prev) => ({ ...prev, sortBy: 'fecha', sortDir: 'asc' }))
                    }
                  }}
                >
                  Fecha {filters.sortBy === 'fecha' ? (filters.sortDir === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => {
                    if (filters.sortBy === 'transcurrido') {
                      setJobFilters((prev) => ({ ...prev, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }))
                    } else {
                      setJobFilters((prev) => ({ ...prev, sortBy: 'transcurrido', sortDir: 'asc' }))
                    }
                  }}
                >
                  Transcurrido {filters.sortBy === 'transcurrido' ? (filters.sortDir === 'asc' ? '▲' : '▼') : ''}
                </TableHead>
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
                paginatedJobs.map((meta) => {
                  const job = meta.job;
                  return (
                    <TableRow
                      key={job.id}
                      onClick={(e) => {
                        const target = e.target as HTMLElement
                        // ignore clicks from interactive controls (selects/buttons/links) — especially necessary because Radix portals bubble
                        if (target.closest('button, a, input, select, textarea, [role="button"]')) return

                        setEditingJob(job)
                        setOpen(true)
                      }}
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      <TableCell className="font-medium">
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
                      <TableCell className="pr-6">
                        <Select
                          value={job.status}
                          onValueChange={(v) => void handleQuickChangeStatus(job.id, v as JobStatus)}
                        >
                          <SelectTrigger
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.target.blur()}
                            className={getStatusPillClass(job.status) + ' focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none'}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <div className="flex items-center gap-2 truncate w-full">
                                <span className="truncate"><SelectValue /></span>
                              </div>
                            </div>
                          </SelectTrigger>

                          <SelectContent position="popper" onClick={(e) => e.stopPropagation()}>
                            <SelectItem value="En laboratorio" className={getStatusTextClass('En laboratorio')}>
                              <span className="flex items-center gap-2">{getStatusIcon('En laboratorio')}En laboratorio</span>
                            </SelectItem>
                            <SelectItem value="En clínica (sin citar)" className={getStatusTextClass('En clínica (sin citar)')}>
                              <span className="flex items-center gap-2">{getStatusIcon('En clínica (sin citar)')}En clínica (sin citar)</span>
                            </SelectItem>
                            <SelectItem value="En clínica (citado)" className={getStatusTextClass('En clínica (citado)')}>
                              <span className="flex items-center gap-2">{getStatusIcon('En clínica (citado)')}En clínica (citado)</span>
                            </SelectItem>
                            <SelectSeparator />
                            <SelectItem value="Cerrado" className={getStatusTextClass('Cerrado')}>
                              <span className="flex items-center gap-2">{getStatusIcon('Cerrado')}Cerrado</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2">
                          <span>{meta.labName || '-'}</span>
                          <a
                            href={meta.labWaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 shadow-sm transition-transform transform hover:scale-105"
                            title="Enviar WhatsApp al laboratorio"
                            tabIndex={0}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            <img src="/whatsapp.svg" alt="WhatsApp" className="w-4 h-4 pointer-events-none" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>{meta.specName || '-'}</TableCell>
                      <TableCell className="pl-8 whitespace-nowrap">{meta.orderDateText}</TableCell>
                      <TableCell className="whitespace-nowrap">{meta.elapsedText}</TableCell>
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
      <Card className="border-slate-200 bg-white/80 p-3 md:p-5 mb-0 flex flex-col flex-1 min-h-0 overflow-hidden">
        <Filtros
          asCard={false}
          filters={labsFilters}
          setFilters={setLabsFilters}
          showPaciente={true}
          showLaboratorio={false}
        />
        <LaboratoriesTable
          asCard={false}
          labs={labs}
          filter={labsFilters.paciente ?? ''}
          onEdit={(lab) => {
            setPendingLaboratorySelection(false)
            setEditingLabId(lab.id)
            setLabOpen(true)
          }}
        />
      </Card>
    )
  } else if (section === 'especialistas') {
    sectionContent = (
      <Card className="border-slate-200 bg-white/80 p-3 md:p-5 mb-0 flex flex-col flex-1 min-h-0 overflow-hidden">
        <Filtros
          asCard={false}
          filters={specialistsFilters}
          setFilters={setSpecialistsFilters}
          showPaciente={true}
          showLaboratorio={false}
          placeholder="Buscar por nombre o especialidad"
        />
        <SpecialistsTable
          asCard={false}
          specialists={specialists}
          filter={specialistsFilters.paciente ?? ''}
          onEdit={(spec) => {
            setPendingSpecialistSelection(false)
            setEditingSpecId(spec.id)
            setSpecOpen(true)
          }}
        />
      </Card>
    )
  } else if (section === 'pacientes') {
    sectionContent = (
      <Card className="border-slate-200 bg-white/80 p-3 md:p-5 mb-0 flex flex-col flex-1 min-h-0 overflow-hidden">
        <Filtros
          asCard={false}
          filters={patientsFilters}
          setFilters={setPatientsFilters}
          showPaciente={true}
          showLaboratorio={false}
          placeholder="Buscar por código, nombre o DNI"
        />
        <PatientsTable
          asCard={false}
          patients={patients}
          filter={patientsFilters.paciente ?? ''}
          onEdit={(patient) => {
            setEditingPatientId(patient.id)
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
      <div className="mx-auto w-full px-3 md:px-6 pt-2 md:pt-4 pb-4 md:pb-6 h-screen flex flex-col">
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
                      setEditingJob(null)
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
                  <Button className="bg-teal-600 text-white hover:bg-teal-500" onClick={() => { setEditingLabId(null); setLabOpen(true); setPendingLaboratorySelection(false); }}>
                    <FlaskConical className="mr-2 h-4 w-4" /> Nuevo laboratorio
                  </Button>
                )
              }
              if (section === 'especialistas') {
                return (
                  <Button className="bg-teal-600 text-white hover:bg-teal-500" onClick={() => { setEditingSpecId(null); setSpecOpen(true); setPendingSpecialistSelection(false); }}>
                    <Stethoscope className="mr-2 h-4 w-4" /> Nuevo especialista
                  </Button>
                )
              }
              if (section === 'pacientes') {
                return (
                  <Button className="bg-teal-600 text-white hover:bg-teal-500" onClick={() => { setEditingPatientId(null); setPatientOpen(true); setPendingPatientSelection(false); }}>
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

      {/* --- Modals --- */}
      <JobDialog
        ref={jobDialogRef}
        open={open}
        editingJob={editingJob}
        patients={patients}
        patientsById={patientsById}
        labs={labs}
        specialists={specialists}
        addJob={addJob}
        onOpenChange={handleJobOpenChange}
        onSaved={handleJobSaved}
        onDeleted={handleJobDeleted}
        onNewLab={() => {
          setPendingLaboratorySelection(true)
          setOpen(false)
          setEditingLabId(null)
          setLabOpen(true)
        }}
        onNewSpec={() => {
          setPendingSpecialistSelection(true)
          setOpen(false)
          setEditingSpecId(null)
          setSpecOpen(true)
        }}
        onNewPatient={() => {
          setPendingPatientSelection(true)
          setOpen(false)
          setEditingPatientId(null)
          setPatientOpen(true)
        }}
      />

      <LabDialog
        open={labOpen}
        editingLabId={editingLabId}
        initialValues={editingLabId
          ? (() => { const l = labs.find((x) => x.id === editingLabId); return { name: l?.name ?? '', phone: l?.phone ?? '', email: l?.email ?? '' } })()
          : { name: '', phone: '', email: '' }
        }
        pendingJobModal={pendingLaboratorySelection}
        onSaved={handleLabSaved}
        onDeleted={handleLabDeleted}
        onClose={handleLabClose}
      />

      <SpecDialog
        open={specOpen}
        editingSpecId={editingSpecId}
        initialValues={editingSpecId
          ? (() => { const s = specialists.find((x) => x.id === editingSpecId); return { name: s?.name ?? '', specialty: s?.specialty ?? '', phone: s?.phone ?? '', email: s?.email ?? '' } })()
          : { name: '', specialty: '', phone: '', email: '' }
        }
        pendingJobModal={pendingSpecialistSelection}
        onSaved={handleSpecSaved}
        onDeleted={handleSpecDeleted}
        onClose={handleSpecClose}
      />

      <PatientDialog
        open={patientOpen}
        editingPatientId={editingPatientId}
        initialValues={editingPatientId
          ? (() => { const p = patients.find((x) => x.id === editingPatientId); return { name: p?.name ?? '', lastname: p?.lastname ?? '', dni: p?.dni ?? '', phone: p?.phone ?? '', email: p?.email ?? '', code: p?.code ?? '' } })()
          : getEmptyPatientForm()
        }
        pendingJobModal={pendingPatientSelection}
        onSaved={handlePatientSaved}
        onDeleted={handlePatientDeleted}
        onClose={handlePatientClose}
      />

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
