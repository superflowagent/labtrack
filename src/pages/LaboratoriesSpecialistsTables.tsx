import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Laboratory, Patient, Specialist } from '@/types/domain';

// Props: labs: Laboratory[]
export function LaboratoriesTable({ labs, filter, onEdit }: { labs: Laboratory[]; filter?: string; onEdit?: (lab: Laboratory) => void }) {
    const [sortBy, setSortBy] = useState<'name' | 'phone' | 'email'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const appliedFilter = (filter || '').toLowerCase();

    const sortedLabs = useMemo(() => {
        const q = appliedFilter;
        let filtered = labs.filter(lab => {
            if (!q) return true;
            return (
                (lab.name || '').toLowerCase().includes(q) ||
                (lab.phone || '').toLowerCase().includes(q) ||
                (lab.email || '').toLowerCase().includes(q)
            );
        });
        filtered = filtered.sort((a, b) => {
            const aVal = a[sortBy] || '';
            const bVal = b[sortBy] || '';
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [labs, sortBy, sortDir, appliedFilter]);

    const handleSort = (col: 'name' | 'phone' | 'email') => {
        if (sortBy === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortBy(col);
            setSortDir('asc');
        }
    };

    return (
        <>
            <Card className="mt-6 border-slate-200 bg-white">
                <Table>
                    <colgroup>
                        <col style={{ width: '40%' }} />
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '30%' }} />
                    </colgroup>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer pl-6" style={{ minWidth: 120 }} onClick={() => handleSort('name')}>
                                Nombre {sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                            </TableHead>
                            <TableHead className="cursor-pointer" style={{ minWidth: 100 }} onClick={() => handleSort('phone')}>
                                Móvil {sortBy === 'phone' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                            </TableHead>
                            <TableHead className="cursor-pointer" style={{ minWidth: 160 }} onClick={() => handleSort('email')}>
                                Email {sortBy === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedLabs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-sm text-slate-500">
                                    No hay laboratorios.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedLabs.map(lab => (
                                <TableRow key={lab.id} onClick={() => onEdit?.(lab)} className={onEdit ? 'cursor-pointer hover:bg-slate-50' : ''} title={onEdit ? 'Editar laboratorio' : undefined}>
                                    <TableCell className="font-medium pl-6">{lab.name || '-'}</TableCell>
                                    <TableCell>{lab.phone || '-'}</TableCell>
                                    <TableCell>{lab.email || '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </>
    );
}

// Props: specialists: Specialist[]
export function SpecialistsTable({ specialists, filter, onEdit }: { specialists: Specialist[]; filter?: string; onEdit?: (spec: Specialist) => void }) {
    const [sortBy, setSortBy] = useState<'name' | 'specialty'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    // `filter` prop will be passed from parent when used as a page table
    const appliedSpecFilter = (filter || '').toLowerCase();

    const sortedSpecs = useMemo(() => {
        const q = appliedSpecFilter;
        let filtered = specialists.filter(s => {
            if (!q) return true;
            return (
                (s.name || '').toLowerCase().includes(q) ||
                (s.specialty || '').toLowerCase().includes(q) ||
                (s.phone || '').toLowerCase().includes(q) ||
                (s.email || '').toLowerCase().includes(q)
            );
        });
        filtered = filtered.sort((a, b) => {
            const aVal = a[sortBy] || '';
            const bVal = b[sortBy] || '';
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [specialists, sortBy, sortDir, appliedSpecFilter]);

    const handleSort = (col: 'name' | 'specialty') => {
        if (sortBy === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortBy(col);
            setSortDir('asc');
        }
    };

    return (
        <>
            <Card className="mt-6 border-slate-200 bg-white">
                <Table>
                    <colgroup>
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                    </colgroup>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer pl-6" style={{ minWidth: 120 }} onClick={() => handleSort('name')}>
                                Nombre {sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                            </TableHead>
                            <TableHead className="cursor-pointer" style={{ minWidth: 120 }} onClick={() => handleSort('specialty')}>
                                Especialidad {sortBy === 'specialty' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                            </TableHead>
                            <TableHead style={{ minWidth: 100 }}>Móvil</TableHead>
                            <TableHead style={{ minWidth: 160 }}>Email</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedSpecs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-sm text-slate-500">
                                    No hay especialistas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedSpecs.map(spec => (
                                <TableRow key={spec.id} onClick={() => onEdit?.(spec)} className={onEdit ? 'cursor-pointer hover:bg-slate-50' : ''} title={onEdit ? 'Editar especialista' : undefined}>
                                    <TableCell className="font-medium pl-6">{spec.name || '-'}</TableCell>
                                    <TableCell>{spec.specialty || '-'}</TableCell>
                                    <TableCell>{spec.phone || '-'}</TableCell>
                                    <TableCell>{spec.email || '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </>
    );
}

export function PatientsTable({ patients, filter, onEdit }: { patients: Patient[]; filter?: string; onEdit?: (patient: Patient) => void }) {
    const [sortBy, setSortBy] = useState<'name' | 'phone' | 'email'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const appliedFilter = (filter || '').toLowerCase();

    const sortedPatients = useMemo(() => {
        const q = appliedFilter;
        let filtered = patients.filter(patient => {
            if (!q) return true;
            return (
                (patient.name || '').toLowerCase().includes(q) ||
                (patient.phone || '').toLowerCase().includes(q) ||
                (patient.email || '').toLowerCase().includes(q) ||
                (patient.code || '').toLowerCase().includes(q)
            );
        });
        filtered = filtered.sort((a, b) => {
            const aVal = a[sortBy] || '';
            const bVal = b[sortBy] || '';
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [patients, sortBy, sortDir, appliedFilter]);

    const handleSort = (col: 'name' | 'phone' | 'email') => {
        if (sortBy === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortBy(col);
            setSortDir('asc');
        }
    };

    return (
        <>
            <Card className="mt-6 border-slate-200 bg-white">
                <Table>
                    <colgroup>
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '30%' }} />
                    </colgroup>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6" style={{ minWidth: 120 }}>Codigo</TableHead>
                            <TableHead className="cursor-pointer" style={{ minWidth: 140 }} onClick={() => handleSort('name')}>
                                Nombre {sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                            </TableHead>
                            <TableHead className="cursor-pointer" style={{ minWidth: 110 }} onClick={() => handleSort('phone')}>
                                Móvil {sortBy === 'phone' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                            </TableHead>
                            <TableHead className="cursor-pointer" style={{ minWidth: 160 }} onClick={() => handleSort('email')}>
                                Email {sortBy === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedPatients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-sm text-slate-500">
                                    No hay pacientes.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedPatients.map(patient => (
                                <TableRow key={patient.id} onClick={() => onEdit?.(patient)} className={onEdit ? 'cursor-pointer hover:bg-slate-50' : ''} title={onEdit ? 'Editar paciente' : undefined}>
                                    <TableCell className="font-medium pl-6">{patient.code || '-'}</TableCell>
                                    <TableCell>{patient.name || '-'}</TableCell>
                                    <TableCell>{patient.phone || '-'}</TableCell>
                                    <TableCell>{patient.email || '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </>
    );
}
