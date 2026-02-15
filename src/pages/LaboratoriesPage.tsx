import { useEffect, useState } from 'react';
import { LaboratoriesTable, SpecialistsTable } from './LaboratoriesSpecialistsTables';
import type { Laboratory, Specialist } from '../types/domain';
import { Card } from '@/components/ui/card';
import { Filtros } from '@/components/Filtros';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchLaboratories, fetchSpecialists, createLaboratory, createSpecialist, getClinicIdForUser } from '@/services/supabase/queries';

export default function LaboratoriesPage() {
    const [labs, setLabs] = useState<Laboratory[]>([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', email: '' });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [filters, setFilters] = useState({ nombre: '' });
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
            const created = await createLaboratory({ name: form.name.trim(), phone: form.phone || null, email: form.email || null })
            setOpen(false);
            setForm({ name: '', phone: '', email: '' });
            setLabs(prev => [created, ...prev])
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'No se pudo guardar');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <h1 className="text-2xl font-semibold mb-4">Laboratorios</h1>
            <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-teal-600 text-white hover:bg-teal-500">
                            Nuevo laboratorio
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Nuevo laboratorio</DialogTitle>
                            <DialogDescription>Completa la información del nuevo laboratorio</DialogDescription>
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
                            <Button type="submit" disabled={saving} className="w-full bg-teal-600 text-white hover:bg-teal-500">
                                {saving ? 'Guardando...' : 'Guardar laboratorio'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <Filtros
                filters={{ paciente: filters.nombre }}
                setFilters={fn => setFilters(f => ({ ...f, nombre: fn(f).paciente }))}
                showPaciente={true}
                showLaboratorio={false}
                showEstado={false}
            />
            <LaboratoriesTable labs={labs} filter={filters.nombre} />
        </div>
    );
}

export function SpecialistsPage() {
    const [specialists, setSpecialists] = useState<Specialist[]>([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: '', specialty: '', phone: '', email: '' });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [filters, setFilters] = useState({ nombre: '' });
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
            const created = await createSpecialist({ name: form.name.trim(), specialty: form.specialty || null, phone: form.phone || null, email: form.email || null })
            setOpen(false);
            setForm({ name: '', specialty: '', phone: '', email: '' });
            setSpecialists(prev => [created, ...prev])
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'No se pudo guardar');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <h1 className="text-2xl font-semibold mb-4">Especialistas</h1>
            <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
                <Dialog open={open} onOpenChange={setOpen}>
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
                            <Button type="submit" disabled={saving} className="w-full bg-teal-600 text-white hover:bg-teal-500">
                                {saving ? 'Guardando...' : 'Guardar especialista'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <Filtros
                filters={{ paciente: filters.nombre }}
                setFilters={fn => setFilters(f => ({ ...f, nombre: fn(f).paciente }))}
                showPaciente={true}
                showLaboratorio={false}
                showEstado={false}
            />
            <SpecialistsTable specialists={specialists} filter={filters.nombre} />
        </div>
    );
}
