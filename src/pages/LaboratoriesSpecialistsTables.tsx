import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Laboratory, Specialist } from '@/types/domain';

// Props: labs: Laboratory[]
export function LaboratoriesTable({ labs, filter }: { labs: Laboratory[]; filter?: string }) {
    const [sortBy, setSortBy] = useState<'name' | 'phone'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const appliedFilter = (filter || '').toLowerCase();

    const sortedLabs = useMemo(() => {
        let filtered = labs.filter(lab => lab.name.toLowerCase().includes(appliedFilter));
        filtered = filtered.sort((a, b) => {
            const aVal = a[sortBy] || '';
            const bVal = b[sortBy] || '';
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [labs, sortBy, sortDir, filter]);

    const handleSort = (col: 'name' | 'phone') => {
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
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                Nombre {sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('phone')}>
                                Móvil {sortBy === 'phone' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedLabs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center text-sm text-slate-500">
                                    No hay laboratorios.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedLabs.map(lab => (
                                <TableRow key={lab.id}>
                                    <TableCell>{lab.name}</TableCell>
                                    <TableCell>{lab.phone || '-'}</TableCell>
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
export function SpecialistsTable({ specialists, filter }: { specialists: Specialist[]; filter?: string }) {
    const [sortBy, setSortBy] = useState<'name' | 'specialty'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    // `filter` prop will be passed from parent when used as a page table
    const appliedSpecFilter = (filter || '').toLowerCase();

    const sortedSpecs = useMemo(() => {
        let filtered = specialists.filter(s => s.name.toLowerCase().includes(appliedSpecFilter));
        filtered = filtered.sort((a, b) => {
            const aVal = a[sortBy] || '';
            const bVal = b[sortBy] || '';
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [specialists, sortBy, sortDir, filter]);

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
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                Nombre {sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('specialty')}>
                                Especialidad {sortBy === 'specialty' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                            </TableHead>
                            <TableHead>Móvil</TableHead>
                            <TableHead>Email</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedSpecs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center text-sm text-slate-500">
                                    No hay especialistas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedSpecs.map(spec => (
                                <TableRow key={spec.id}>
                                    <TableCell>{spec.name}</TableCell>
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
