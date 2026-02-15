import { useEffect, useState } from 'react';
import { LaboratoriesTable, SpecialistsTable } from './LaboratoriesSpecialistsTables';
import type { Laboratory, Specialist } from '../types/domain';
import { Filtros } from '@/components/Filtros';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Snackbar } from '@/components/ui/snackbar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchLaboratories, fetchSpecialists, createLaboratory, createSpecialist, updateLaboratory, updateSpecialist, deleteLaboratory, deleteSpecialist, getClinicIdForUser } from '@/services/supabase/queries';

export default function LaboratoriesPage() {
    const [labs, setLabs] = useState<Laboratory[]>([]);
    const [open, setOpen] = useState(false);
    const [editingLabId, setEditingLabId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', phone: '', email: '' });
    const [saving, setSaving] = useState(false);
    const [deletingLab, setDeletingLab] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [filters, setFilters] = useState({ nombre: '' });

    const [snackbar, setSnackbar] = useState<{ open: boolean; kind?: 'lab' | 'spec'; item?: Laboratory | Specialist | null; message?: string }>({ open: false })

    const handleUndo = async () => {
        if (!snackbar.open || !snackbar.item) return;
        const item = snackbar.item as Laboratory;
        setSnackbar({ open: false });
        try {
            const restored = await createLaboratory({ name: item.name, phone: item.phone || null, email: item.email || null });
            setLabs(prev => [restored, ...prev]);
        } catch {
            // ignore
        }
    }
    useEffect(() => {
        (async () => {
            try {
                const clinicId = await getClinicIdForUser()
                const labs = await fetchLaboratories(clinicId)
                setLabs(labs)
            } catch (err) {
                console.error(err)
            }
        })()
    }, []);

    const handleCreate = async () => {
        setSaving(true);
        setFormError(null);
        try {
            if (!form.name.trim()) {
                throw new Error('El nombre del laboratorio es obligatorio');
            }
            if (editingLabId) {
                const updated = await updateLaboratory(editingLabId, { name: form.name.trim(), phone: form.phone || null, email: form.email || null })
                setOpen(false);
                setForm({ name: '', phone: '', email: '' });
                setLabs(prev => prev.map(l => l.id === updated.id ? updated : l))
                setEditingLabId(null)
            } else {
                const created = await createLaboratory({ name: form.name.trim(), phone: form.phone || null, email: form.email || null })
                setOpen(false);
                setForm({ name: '', phone: '', email: '' });
                setLabs(prev => [created, ...prev])
            }
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'No se pudo guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!editingLabId) return;
        setDeletingLab(true);
        setFormError(null);
        try {
            const deleted = await deleteLaboratory(editingLabId);
            setSnackbar({ open: true, kind: 'lab', item: deleted, message: 'Laboratorio eliminado' });
            setOpen(false);
            setForm({ name: '', phone: '', email: '' });
            setLabs(prev => prev.filter(l => l.id !== editingLabId));
            setEditingLabId(null);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'No se pudo eliminar');
        } finally {
            setDeletingLab(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <h1 className="text-2xl font-semibold mb-4">Laboratorios</h1>
            <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingLabId(null); setForm({ name: '', phone: '', email: '' }); } }}>
                    <DialogTrigger asChild>
                        <Button className="bg-teal-600 text-white hover:bg-teal-500">
                            Nuevo laboratorio
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingLabId ? 'Editar laboratorio' : 'Nuevo laboratorio'}</DialogTitle>
                            <DialogDescription>Completa la información del {editingLabId ? 'laboratorio' : 'nuevo laboratorio'}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={async (e) => { e.preventDefault(); await handleCreate(); }} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Nombre del laboratorio"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Móvil</Label>
                                <Input
                                    value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="Teléfono de contacto"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="Email del laboratorio"
                                />
                            </div>
                            {formError && <p className="text-sm text-rose-600">{formError}</p>}
                            <div className="flex gap-4">
                                {editingLabId && (
                                    <Button type="button" variant="destructive" className="flex-1" disabled={saving || deletingLab} onClick={handleDelete}>
                                        {deletingLab ? 'Eliminando...' : 'Eliminar laboratorio'}
                                    </Button>
                                )}
                                <Button type="submit" disabled={saving || deletingLab} className="flex-1 bg-teal-600 text-white hover:bg-teal-500">
                                    {saving ? 'Guardando...' : (editingLabId ? 'Guardar cambios' : 'Guardar laboratorio')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <Filtros
                filters={{ paciente: filters.nombre }}
                setFilters={(updated) => {
                    if (typeof updated === 'function') {
                        setFilters((f) => {
                            const result = updated({ paciente: f.nombre, laboratorioId: undefined, estado: undefined });
                            return { ...f, nombre: result.paciente ?? '' };
                        });
                    } else {
                        setFilters((f) => ({ ...f, nombre: updated.paciente ?? '' }));
                    }
                }}
                showPaciente={true}
                showLaboratorio={false}
                showEstado={false}
            />
            <LaboratoriesTable labs={labs} filter={filters.nombre} onEdit={(lab) => { setEditingLabId(lab.id); setForm({ name: lab.name, phone: lab.phone || '', email: lab.email || '' }); setOpen(true); }} />

            <Snackbar open={!!snackbar.open} message={snackbar.message || ''} actionLabel="Deshacer" onAction={handleUndo} onClose={() => setSnackbar({ open: false })} />
        </div>
    );
}

export function SpecialistsPage() {
    const [specialists, setSpecialists] = useState<Specialist[]>([]);
    const [open, setOpen] = useState(false);
    const [editingSpecId, setEditingSpecId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', specialty: '', phone: '', email: '' });
    const [saving, setSaving] = useState(false);
    const [deletingSpec, setDeletingSpec] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [filters, setFilters] = useState({ nombre: '' });

    const [snackbar, setSnackbar] = useState<{ open: boolean; kind?: 'lab' | 'spec'; item?: Laboratory | Specialist | null; message?: string }>({ open: false })

    const handleUndo = async () => {
        if (!snackbar.open || !snackbar.item) return;
        const item = snackbar.item as Specialist;
        setSnackbar({ open: false });
        try {
            const restored = await createSpecialist({ name: item.name, specialty: item.specialty || null, phone: item.phone || null, email: item.email || null });
            setSpecialists(prev => [restored, ...prev]);
        } catch {
            // ignore
        }
    }
    useEffect(() => {
        (async () => {
            try {
                const clinicId = await getClinicIdForUser()
                const specs = await fetchSpecialists(clinicId)
                setSpecialists(specs)
            } catch (err) {
                console.error(err)
            }
        })()
    }, []);

    const handleCreate = async () => {
        setSaving(true);
        setFormError(null);
        try {
            if (!form.name.trim()) {
                throw new Error('El nombre del especialista es obligatorio');
            }
            if (editingSpecId) {
                const updated = await updateSpecialist(editingSpecId, { name: form.name.trim(), specialty: form.specialty || null, phone: form.phone || null, email: form.email || null })
                setOpen(false);
                setForm({ name: '', specialty: '', phone: '', email: '' });
                setSpecialists(prev => prev.map(s => s.id === updated.id ? updated : s))
                setEditingSpecId(null)
            } else {
                const created = await createSpecialist({ name: form.name.trim(), specialty: form.specialty || null, phone: form.phone || null, email: form.email || null })
                setOpen(false);
                setForm({ name: '', specialty: '', phone: '', email: '' });
                setSpecialists(prev => [created, ...prev])
            }
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'No se pudo guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!editingSpecId) return;
        setDeletingSpec(true);
        setFormError(null);
        try {
            const deleted = await deleteSpecialist(editingSpecId);
            setSnackbar({ open: true, kind: 'spec', item: deleted, message: 'Especialista eliminado' });
            setOpen(false);
            setForm({ name: '', specialty: '', phone: '', email: '' });
            setSpecialists(prev => prev.filter(s => s.id !== editingSpecId));
            setEditingSpecId(null);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'No se pudo eliminar');
        } finally {
            setDeletingSpec(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <h1 className="text-2xl font-semibold mb-4">Especialistas</h1>
            <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingSpecId(null); setForm({ name: '', specialty: '', phone: '', email: '' }); } }}>
                    <DialogTrigger asChild>
                        <Button className="bg-teal-600 text-white hover:bg-teal-500">
                            Nuevo especialista
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Nuevo especialista</DialogTitle>
                            <DialogDescription>Completa la información del nuevo especialista</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={async (e) => { e.preventDefault(); await handleCreate(); }} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Nombre del especialista"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Especialidad</Label>
                                <Input
                                    value={form.specialty}
                                    onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                                    placeholder="Especialidad"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Móvil</Label>
                                <Input
                                    value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="Teléfono de contacto"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="Email del especialista"
                                />
                            </div>
                            {formError && <p className="text-sm text-rose-600">{formError}</p>}
                            <div className="flex gap-4">
                                {editingSpecId && (
                                    <Button type="button" variant="destructive" className="flex-1" disabled={saving || deletingSpec} onClick={handleDelete}>
                                        {deletingSpec ? 'Eliminando...' : 'Eliminar especialista'}
                                    </Button>
                                )}
                                <Button type="submit" disabled={saving || deletingSpec} className="flex-1 bg-teal-600 text-white hover:bg-teal-500">
                                    {saving ? 'Guardando...' : (editingSpecId ? 'Guardar cambios' : 'Guardar especialista')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <Filtros
                filters={{ paciente: filters.nombre }}
                setFilters={(updated) => {
                    if (typeof updated === 'function') {
                        setFilters((f) => {
                            const result = updated({ paciente: f.nombre, laboratorioId: undefined, estado: undefined });
                            return { ...f, nombre: result.paciente ?? '' };
                        });
                    } else {
                        setFilters((f) => ({ ...f, nombre: updated.paciente ?? '' }));
                    }
                }}
                showPaciente={true}
                showLaboratorio={false}
                showEstado={false}
            />
            <SpecialistsTable specialists={specialists} filter={filters.nombre} onEdit={(s) => { setEditingSpecId(s.id); setForm({ name: s.name, specialty: s.specialty || '', phone: s.phone || '', email: s.email || '' }); setOpen(true); }} />

            <Snackbar open={!!snackbar.open} message={snackbar.message || ''} actionLabel="Deshacer" onAction={handleUndo} onClose={() => setSnackbar({ open: false })} />
        </div>
    );
}
