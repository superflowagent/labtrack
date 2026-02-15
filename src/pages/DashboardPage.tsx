import { useMemo, useState, useEffect } from 'react'
import { format } from 'date-fns'
import { LaboratoriesTable, SpecialistsTable } from './LaboratoriesSpecialistsTables';
// import { useLocation, useNavigate } from 'react-router-dom';
import { getClinicForUser } from '@/services/supabase/clinic'
import { createLaboratory, createSpecialist } from '@/services/supabase/queries'
import { ClipboardPlus, FlaskConical, Stethoscope } from 'lucide-react'
import { useJobs } from '@/hooks/useJobs'
// import { LaboratoriesTable, SpecialistsTable } from './LaboratoriesSpecialistsTables';
import type { JobStatus } from '@/types/domain'
import { Button } from '@/components/ui/button'
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
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { Filtros } from '@/components/Filtros'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const STATUSES: JobStatus[] = [
  'En laboratorio',
  'En clinica (sin citar)',
  'En clinica (citado)',
  'Cerrado',
]

export const DashboardPage = () => {
  const [section, setSection] = useState<'trabajos' | 'laboratorios' | 'especialistas'>('trabajos');
  // Exponer setSection globalmente para Sidebar
  window.setDashboardSection = setSection;

  useEffect(() => {
    getClinicForUser().then((c) => {
      if (c?.name) {
        window.clinicName = c.name;
        window.dispatchEvent(new Event('clinicNameChanged'));
      }
    }).catch(() => {/* ignore */ })
  }, [])
  const { jobs, labs, specialists, loading, error, addJob, reload } = useJobs()
  const [filters, setFilters] = useState({ paciente: '', laboratorioId: 'all', estado: 'all', sortBy: 'fecha' })
  const [labsFilters, setLabsFilters] = useState({ nombre: '' })
  const [specialistsFilters, setSpecialistsFilters] = useState({ nombre: '' })
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    patient_name: '',
    patient_phone: '',
    job_description: '',
    laboratory_id: '',
    specialist_id: '',
    order_date: '',
    status: STATUSES[0],
  })
  // Al abrir el modal de 'Nuevo trabajo' selecciona por defecto la fecha actual
  useEffect(() => {
    if (!open) return;
    setForm(prev => prev.order_date ? prev : ({ ...prev, order_date: new Date().toISOString().slice(0, 10) }));
  }, [open]);
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Lab modal (moved here so the top-right button controls the dialog)
  const [labOpen, setLabOpen] = useState(false)
  const [labForm, setLabForm] = useState({ name: '', phone: '', email: '' })
  const [labSaving, setLabSaving] = useState(false)
  const [labFormError, setLabFormError] = useState<string | null>(null)

  const handleCreateLab = async () => {
    setLabSaving(true)
    setLabFormError(null)
    try {
      if (!labForm.name.trim()) throw new Error('El nombre del laboratorio es obligatorio')
      await createLaboratory({ name: labForm.name.trim(), phone: labForm.phone || null, email: labForm.email || null })
      setLabOpen(false)
      setLabForm({ name: '', phone: '', email: '' })
      await reload()
    } catch (err) {
      setLabFormError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setLabSaving(false)
    }
  }

  // Specialist modal (moved here as well)
  const [specOpen, setSpecOpen] = useState(false)
  const [specForm, setSpecForm] = useState({ name: '', specialty: '', phone: '', email: '' })
  const [specSaving, setSpecSaving] = useState(false)
  const [specFormError, setSpecFormError] = useState<string | null>(null)

  const handleCreateSpec = async () => {
    setSpecSaving(true)
    setSpecFormError(null)
    try {
      if (!specForm.name.trim()) throw new Error('El nombre del especialista es obligatorio')
      await createSpecialist({ name: specForm.name.trim(), specialty: specForm.specialty || null, phone: specForm.phone || null, email: specForm.email || null })
      setSpecOpen(false)
      setSpecForm({ name: '', specialty: '', phone: '', email: '' })
      await reload()
    } catch (err) {
      setSpecFormError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSpecSaving(false)
    }
  }

  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter((job) => {
      const matchPaciente = filters.paciente
        ? job.patient_name.toLowerCase().includes(filters.paciente.toLowerCase())
        : true
      const matchLab = filters.laboratorioId !== 'all' ? job.laboratory_id === filters.laboratorioId : true
      const matchEstado = filters.estado !== 'all' ? job.status === filters.estado : true
      return matchPaciente && matchLab && matchEstado
    });
    // Ordenamiento
    const { sortBy } = filters;
    filtered = filtered.slice();
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'paciente':
          return a.patient_name.localeCompare(b.patient_name);
        case 'paciente_desc':
          return b.patient_name.localeCompare(a.patient_name);
        case 'trabajo':
          return (a.job_description || '').localeCompare(b.job_description || '');
        case 'trabajo_desc':
          return (b.job_description || '').localeCompare(a.job_description || '');
        case 'laboratorio':
          return (labs.find(l => l.id === a.laboratory_id)?.name || '').localeCompare(labs.find(l => l.id === b.laboratory_id)?.name || '');
        case 'laboratorio_desc':
          return (labs.find(l => l.id === b.laboratory_id)?.name || '').localeCompare(labs.find(l => l.id === a.laboratory_id)?.name || '');
        case 'fecha':
          return (a.order_date || '').localeCompare(b.order_date || '');
        case 'fecha_desc':
          return (b.order_date || '').localeCompare(a.order_date || '');
        case 'estado':
          return a.status.localeCompare(b.status);
        case 'estado_desc':
          return b.status.localeCompare(a.status);
        default:
          return 0;
      }
    });
    return filtered;
  }, [jobs, filters, labs]);

  const handleCreate = async () => {
    setSaving(true)
    setFormError(null)

    try {
      if (!form.patient_name.trim()) {
        throw new Error('El nombre del paciente es obligatorio')
      }

      await addJob({
        patient_name: form.patient_name.trim(),
        patient_phone: form.patient_phone || null,
        job_description: form.job_description || null,
        laboratory_id: form.laboratory_id || null,
        specialist_id: form.specialist_id || null,
        order_date: form.order_date || null,
        status: form.status,
      })

      setOpen(false)
      setForm({
        patient_name: '',
        patient_phone: '',
        job_description: '',
        laboratory_id: '',
        specialist_id: '',
        order_date: '',
        status: STATUSES[0],
      })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  let sectionContent = null;
  if (section === 'trabajos') {
    sectionContent = (
      <>
        <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 text-white hover:bg-teal-500">
                <ClipboardPlus className="mr-2 h-4 w-4" /> Nuevo trabajo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuevo trabajo</DialogTitle>
                <DialogDescription>Completa la información del nuevo trabajo</DialogDescription>
              </DialogHeader>
              <form onSubmit={async (e) => { e.preventDefault(); await handleCreate(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <Input
                    value={form.patient_name}
                    onChange={(event) => setForm((prev) => ({ ...prev, patient_name: event.target.value }))}
                    placeholder="Nombre del paciente"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Móvil</Label>
                  <Input
                    value={form.patient_phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, patient_phone: event.target.value }))}
                    placeholder="Teléfono del paciente"
                  />
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
                    <Label>Salida trabajo</Label>
                    <DatePicker
                      date={form.order_date ? new Date(form.order_date) : undefined}
                      setDate={(date) => setForm((prev) => ({ ...prev, order_date: date ? date.toISOString().slice(0, 10) : '' }))}
                      placeholder="Selecciona la fecha de salida"
                    />
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
                  <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as JobStatus }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => {
                        let color = '';
                        switch (status) {
                          case 'En laboratorio':
                            color = 'text-blue-600';
                            break;
                          case 'En clinica (sin citar)':
                            color = 'text-yellow-600';
                            break;
                          case 'En clinica (citado)':
                            color = 'text-green-600';
                            break;
                          case 'Cerrado':
                            color = 'text-gray-500';
                            break;
                          default:
                            color = '';
                        }
                        return (
                          <SelectItem key={status} value={status} className={color}>
                            {status}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                {formError && <p className="text-sm text-rose-600">{formError}</p>}
                <Button type="submit" disabled={saving} className="w-full bg-teal-600 text-white hover:bg-teal-500">
                  {saving ? 'Guardando...' : 'Guardar trabajo'}
                </Button>
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
              <Select
                value={filters.estado}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, estado: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {STATUSES.map((status) => {
                    let color = '';
                    switch (status) {
                      case 'En laboratorio':
                        color = 'text-blue-600';
                        break;
                      case 'En clinica (sin citar)':
                        color = 'text-yellow-600';
                        break;
                      case 'En clinica (citado)':
                        color = 'text-green-600';
                        break;
                      case 'Cerrado':
                        color = 'text-gray-500';
                        break;
                      default:
                        color = '';
                    }
                    return (
                      <SelectItem key={status} value={status} className={color}>
                        {status}
                      </SelectItem>
                    );
                  })}
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
          </div>
        </Card>
        <Card className="mt-6 border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer pl-6" onClick={() => {
                  setFilters(f => ({ ...f, sortBy: f.sortBy === 'paciente' ? 'paciente_desc' : 'paciente' }))
                }}>
                  Paciente
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => {
                  setFilters(f => ({ ...f, sortBy: f.sortBy === 'trabajo' ? 'trabajo_desc' : 'trabajo' }))
                }}>
                  Trabajo
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => {
                  setFilters(f => ({ ...f, sortBy: f.sortBy === 'laboratorio' ? 'laboratorio_desc' : 'laboratorio' }))
                }}>
                  Laboratorio
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => {
                  setFilters(f => ({ ...f, sortBy: f.sortBy === 'fecha' ? 'fecha_desc' : 'fecha' }))
                }}>
                  Fecha
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => {
                  setFilters(f => ({ ...f, sortBy: f.sortBy === 'estado' ? 'estado_desc' : 'estado' }))
                }}>
                  Estado
                </TableHead>
                <TableHead>Transcurrido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-slate-500">
                    Cargando trabajos...
                  </TableCell>
                </TableRow>
              )}
              {error && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-rose-500">
                    {error}
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && filteredJobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-slate-500">
                    No hay trabajos con esos filtros.
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && filteredJobs.map((job) => {
                // Calcular tiempo transcurrido desde la fecha de pedido
                let transcurrido = '-';
                if (job.order_date) {
                  const orderDate = new Date(job.order_date);
                  const now = new Date();
                  const diffMs = now.getTime() - orderDate.getTime();
                  if (!isNaN(diffMs) && diffMs > 0) {
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
                    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
                    if (diffDays > 0) {
                      transcurrido = `${diffDays}d ${diffHours}h`;
                    } else if (diffHours > 0) {
                      transcurrido = `${diffHours}h ${diffMinutes}m`;
                    } else {
                      transcurrido = `${diffMinutes}m`;
                    }
                  }
                }
                return (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium pl-6">{job.patient_name}</TableCell>
                    <TableCell>{job.job_description || 'Sin descripcion'}</TableCell>
                    <TableCell>{labs.find((lab) => lab.id === job.laboratory_id)?.name || '-'}</TableCell>
                    <TableCell>{job.order_date ? format(new Date(job.order_date), 'dd-MM-yyyy') : '-'}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                        {job.status}
                      </span>
                    </TableCell>
                    <TableCell>{transcurrido}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </>
    );
  } else if (section === 'laboratorios') {
    sectionContent = (
      <>
        <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
          <Dialog open={labOpen} onOpenChange={setLabOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 text-white hover:bg-teal-500">
                <FlaskConical className="mr-2 h-4 w-4" /> Nuevo laboratorio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuevo laboratorio</DialogTitle>
                <DialogDescription>Completa la información del nuevo laboratorio</DialogDescription>
              </DialogHeader>
              <form onSubmit={async (e) => { e.preventDefault(); await handleCreateLab(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={labForm.name}
                    onChange={e => setLabForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nombre del laboratorio"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Móvil</Label>
                  <Input
                    value={labForm.phone}
                    onChange={e => setLabForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="Teléfono de contacto"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={labForm.email}
                    onChange={e => setLabForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Email del laboratorio"
                  />
                </div>
                {labFormError && <p className="text-sm text-rose-600">{labFormError}</p>}
                <Button type="submit" disabled={labSaving} className="w-full bg-teal-600 text-white hover:bg-teal-500">
                  {labSaving ? 'Guardando...' : 'Guardar laboratorio'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Filtros
          filters={{ paciente: labsFilters.nombre }}
          setFilters={(fn) => setLabsFilters((f) => ({ ...f, nombre: fn(f).paciente }))}
          showPaciente={true}
          showLaboratorio={false}
          showEstado={false}
        />
        <LaboratoriesTable labs={labs} filter={labsFilters.nombre} />
      </>
    );
  } else if (section === 'especialistas') {
    sectionContent = (
      <>
        <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
          <Dialog open={specOpen} onOpenChange={setSpecOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 text-white hover:bg-teal-500">
                <Stethoscope className="mr-2 h-4 w-4" /> Nuevo especialista
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuevo especialista</DialogTitle>
                <DialogDescription>Completa la información del nuevo especialista</DialogDescription>
              </DialogHeader>
              <form onSubmit={async (e) => { e.preventDefault(); await handleCreateSpec(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={specForm.name}
                    onChange={e => setSpecForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nombre del especialista"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Especialidad</Label>
                  <Input
                    value={specForm.specialty}
                    onChange={e => setSpecForm(f => ({ ...f, specialty: e.target.value }))}
                    placeholder="Especialidad"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Móvil</Label>
                  <Input
                    value={specForm.phone}
                    onChange={e => setSpecForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="Teléfono de contacto"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={specForm.email}
                    onChange={e => setSpecForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Email del especialista"
                  />
                </div>
                {specFormError && <p className="text-sm text-rose-600">{specFormError}</p>}
                <Button type="submit" disabled={specSaving} className="w-full bg-teal-600 text-white hover:bg-teal-500">
                  {specSaving ? 'Guardando...' : 'Guardar especialista'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Filtros
          filters={{ paciente: specialistsFilters.nombre }}
          setFilters={(fn) => setSpecialistsFilters((f) => ({ ...f, nombre: fn(f).paciente }))}
          showPaciente={true}
          showLaboratorio={false}
          showEstado={false}
        />
        <SpecialistsTable specialists={specialists} filter={specialistsFilters.nombre} />
      </>
    );
  }
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Título eliminado, el nombre de la clínica se pasará a Sidebar */}
        {sectionContent}
      </div>
    </div>
  );
}
