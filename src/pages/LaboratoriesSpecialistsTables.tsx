import { useMemo, useState, useEffect, useRef } from 'react';
import { Card, CardFooter } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Laboratory, Patient, Specialist } from '@/types/domain';
import { normalizeSearch, TABLE_ROW_HEIGHT } from '@/lib/utils';

// Props: labs: Laboratory[]
export function LaboratoriesTable({ labs, filter, onEdit }: { labs: Laboratory[]; filter?: string; onEdit?: (lab: Laboratory) => void }) {
    const [sortBy, setSortBy] = useState<'name' | 'phone' | 'email'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const appliedFilter = normalizeSearch(filter);

    const sortedLabs = useMemo(() => {
        const q = appliedFilter;
        let filtered = labs.filter(lab => {
            if (!q) return true;
            return (
                normalizeSearch(lab.name).includes(q) ||
                normalizeSearch(lab.phone).includes(q) ||
                normalizeSearch(lab.email).includes(q)
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

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const labsTableRef = useRef<HTMLTableElement | null>(null);

    const labsTotalPages = Math.max(1, Math.ceil(sortedLabs.length / pageSize));
    const effectivePage = Math.min(page, labsTotalPages);

    const paginatedLabs = useMemo(() => {
        const start = (effectivePage - 1) * pageSize;
        return sortedLabs.slice(start, start + pageSize);
    }, [sortedLabs, effectivePage, pageSize]);

    useEffect(() => {
        const tableEl = labsTableRef.current;
        if (!tableEl) return;
        const container = tableEl.parentElement as HTMLElement | null;
        const measure = () => {
            const headerH = (tableEl.querySelector('thead') as HTMLElement | null)?.offsetHeight ?? 0;
            const rowsInDOM = tableEl.querySelectorAll('tbody tr').length;
            // use fixed row height so measurement is deterministic
            const rowH = TABLE_ROW_HEIGHT;

            const containerH = container?.clientHeight ?? 0;
            const rowsThatFit = Math.max(1, Math.floor((containerH - headerH) / rowH));
            const capped = Math.min(rowsThatFit, 50);
            if (capped !== pageSize) setPageSize(capped);
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (container) ro.observe(container);
        window.addEventListener('resize', measure);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [sortedLabs.length, pageSize]);

    const handleSort = (col: 'name' | 'phone' | 'email') => {
        if (sortBy === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortBy(col);
            setSortDir('asc');
        }
    };

    return (
        <>
            <Card className="mt-6 border-slate-200 bg-white flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-0 flex-1 min-h-0">
                    <Table ref={labsTableRef} className="h-full">
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
                            {paginatedLabs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-sm text-slate-500">
                                        No hay laboratorios.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedLabs.map(lab => (
                                    <TableRow key={lab.id} onClick={() => onEdit?.(lab)} className={onEdit ? 'cursor-pointer hover:bg-slate-50' : ''} title={onEdit ? 'Editar laboratorio' : undefined}>
                                        <TableCell className="font-medium pl-6">{lab.name || '-'}</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <span className="truncate">{lab.phone || '-'}</span>
                                            {lab.phone ? (
                                                <a
                                                    href={`https://wa.me/${lab.phone}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 shadow-sm transition-transform transform hover:scale-105"
                                                    title="Abrir WhatsApp"
                                                    onClick={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                    tabIndex={0}
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
                                        </TableCell>
                                        <TableCell>{lab.email || '-'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <CardFooter>
                    <Pagination total={sortedLabs.length} page={effectivePage} pageSize={pageSize} onPageChange={setPage} />
                </CardFooter>
            </Card>
        </>
    );
}

// Props: specialists: Specialist[]
export function SpecialistsTable({ specialists, filter, onEdit }: { specialists: Specialist[]; filter?: string; onEdit?: (spec: Specialist) => void }) {
    const [sortBy, setSortBy] = useState<'name' | 'specialty'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    // `filter` prop will be passed from parent when used as a page table
    const appliedSpecFilter = normalizeSearch(filter);

    const sortedSpecs = useMemo(() => {
        const q = appliedSpecFilter;
        let filtered = specialists.filter(s => {
            if (!q) return true;
            return (
                normalizeSearch(s.name).includes(q) ||
                normalizeSearch(s.specialty).includes(q) ||
                normalizeSearch(s.phone).includes(q) ||
                normalizeSearch(s.email).includes(q)
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

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const specsTableRef = useRef<HTMLTableElement | null>(null);

    const specsTotalPages = Math.max(1, Math.ceil(sortedSpecs.length / pageSize));
    const effectivePage = Math.min(page, specsTotalPages);

    const paginatedSpecs = useMemo(() => {
        const start = (effectivePage - 1) * pageSize;
        return sortedSpecs.slice(start, start + pageSize);
    }, [sortedSpecs, effectivePage, pageSize]);

    useEffect(() => {
        const tableEl = specsTableRef.current;
        if (!tableEl) return;
        const container = tableEl.parentElement as HTMLElement | null;
        const measure = () => {
            const headerH = (tableEl.querySelector('thead') as HTMLElement | null)?.offsetHeight ?? 0;
            const rowsInDOM = tableEl.querySelectorAll('tbody tr').length;
            // use fixed row height so measurement is deterministic
            const rowH = TABLE_ROW_HEIGHT;

            const containerH = container?.clientHeight ?? 0;
            const rowsThatFit = Math.max(1, Math.floor((containerH - headerH) / rowH));
            const capped = Math.min(rowsThatFit, 50);
            if (capped !== pageSize) setPageSize(capped);
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (container) ro.observe(container);
        window.addEventListener('resize', measure);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [sortedSpecs.length, pageSize]);

    const handleSort = (col: 'name' | 'specialty') => {
        if (sortBy === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortBy(col);
            setSortDir('asc');
        }
    };

    return (
        <>
            <Card className="mt-6 border-slate-200 bg-white flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-0 flex-1 min-h-0">
                    <Table ref={specsTableRef} className="h-full">
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
                            {paginatedSpecs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-sm text-slate-500">
                                        No hay especialistas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedSpecs.map(spec => (
                                    <TableRow key={spec.id} onClick={() => onEdit?.(spec)} className={onEdit ? 'cursor-pointer hover:bg-slate-50' : ''} title={onEdit ? 'Editar especialista' : undefined}>
                                        <TableCell className="font-medium pl-6">{spec.name || '-'}</TableCell>
                                        <TableCell>{spec.specialty || '-'}</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <span className="truncate">{spec.phone || '-'}</span>
                                            {spec.phone ? (
                                                <a
                                                    href={`https://wa.me/${spec.phone}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 shadow-sm transition-transform transform hover:scale-105"
                                                    title="Abrir WhatsApp"
                                                    onClick={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                    tabIndex={0}
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
                                        </TableCell>
                                        <TableCell>{spec.email || '-'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <CardFooter>
                    <Pagination total={sortedSpecs.length} page={effectivePage} pageSize={pageSize} onPageChange={setPage} />
                </CardFooter>
            </Card>
        </>
    );
}

export function PatientsTable({ patients, filter, onEdit }: { patients: Patient[]; filter?: string; onEdit?: (patient: Patient) => void }) {
    const [sortBy, setSortBy] = useState<'name' | 'phone' | 'email'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const appliedFilter = normalizeSearch(filter);

    const sortedPatients = useMemo(() => {
        const q = appliedFilter;
        let filtered = patients.filter(patient => {
            if (!q) return true;
            return (
                normalizeSearch(patient.name).includes(q) ||
                normalizeSearch(patient.phone).includes(q) ||
                normalizeSearch(patient.email).includes(q) ||
                normalizeSearch(patient.code).includes(q)
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

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const patientsTableRef = useRef<HTMLTableElement | null>(null);

    const patientsTotalPages = Math.max(1, Math.ceil(sortedPatients.length / pageSize));
    const effectivePage = Math.min(page, patientsTotalPages);

    const paginatedPatients = useMemo(() => {
        const start = (effectivePage - 1) * pageSize;
        return sortedPatients.slice(start, start + pageSize);
    }, [sortedPatients, effectivePage, pageSize]);

    useEffect(() => {
        const tableEl = patientsTableRef.current;
        if (!tableEl) return;
        const container = tableEl.parentElement as HTMLElement | null;
        const measure = () => {
            const headerH = (tableEl.querySelector('thead') as HTMLElement | null)?.offsetHeight ?? 0;
            const rowsInDOM = tableEl.querySelectorAll('tbody tr').length;
            // use fixed row height so measurement is deterministic
            const rowH = TABLE_ROW_HEIGHT;

            const containerH = container?.clientHeight ?? 0;
            const rowsThatFit = Math.max(1, Math.floor((containerH - headerH) / rowH));
            const capped = Math.min(rowsThatFit, 50);
            if (capped !== pageSize) setPageSize(capped);
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (container) ro.observe(container);
        window.addEventListener('resize', measure);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [sortedPatients.length, pageSize]);

    const handleSort = (col: 'name' | 'phone' | 'email') => {
        if (sortBy === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortBy(col);
            setSortDir('asc');
        }
    };

    return (
        <>
            <Card className="mt-6 border-slate-200 bg-white flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-0 flex-1 min-h-0">
                    <Table ref={patientsTableRef} className="h-full">
                        <colgroup>
                            <col style={{ width: '20%' }} />
                            <col style={{ width: '30%' }} />
                            <col style={{ width: '20%' }} />
                            <col style={{ width: '30%' }} />
                        </colgroup>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6" style={{ minWidth: 120 }}>Código</TableHead>
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
                                paginatedPatients.map(patient => (
                                    <TableRow key={patient.id} onClick={() => onEdit?.(patient)} className={onEdit ? 'cursor-pointer hover:bg-slate-50' : ''} title={onEdit ? 'Editar paciente' : undefined}>
                                        <TableCell className="font-medium pl-6">{patient.code || '-'}</TableCell>
                                        <TableCell>{patient.name || '-'}</TableCell>
                                        <TableCell className="flex items-center gap-2 /*wa-icon*/">
                                            <span className="truncate">{patient.phone || '-'}</span>
                                            {patient.phone ? (
                                                <a
                                                    href={`https://wa.me/${patient.phone}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 shadow-sm transition-transform transform hover:scale-105"
                                                    title="Abrir WhatsApp"
                                                    onClick={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                    tabIndex={0}
                                                >
                                                    <img src="/whatsapp.svg" alt="WhatsApp" className="w-4 h-4 pointer-events-none" />
                                                    <path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6 C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19c0,0,0,0,0,0h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z" />
                                                    <path fill="#fff" d="M4.9,43.8c-0.1,0-0.3-0.1-0.4-0.1c-0.1-0.1-0.2-0.3-0.1-0.5L7,33.5c-1.6-2.9-2.5-6.2-2.5-9.6 C4.5,13.2,13.3,4.5,24,4.5c5.2,0,10.1,2,13.8,5.7c3.7,3.7,5.7,8.6,5.7,13.8c0,10.7-8.7,19.5-19.5,19.5c-3.2,0-6.3-0.8-9.1-2.3 L5,43.8C5,43.8,4.9,43.8,4.9,43.8z" />
                                                    <path fill="#cfd8dc" d="M24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3 L4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5 M24,43L24,43L24,43 M24,43L24,43L24,43 M24,4L24,4C13,4,4,13,4,24 c0,3.4,0.8,6.7,2.5,9.6L3.9,43c-0.1,0.3,0,0.7,0.3,1c0.2,0.2,0.4,0.3,0.7,0.3c0.1,0,0.2,0,0.3,0l9.7-2.5c2.8,1.5,6,2.2,9.2,2.2 c11,0,20-9,20-20c0-5.3-2.1-10.4-5.8-14.1C34.4,6.1,29.4,4,24,4L24,4z" />
                                                    <path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8 l6-1.6l0.6,0.3c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z" />
                                                    <path fill="#fff" fillRule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0 s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3 c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9 c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8 c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8C20.6,19.3,19.7,17,19.3,16z" clipRule="evenodd" />
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
                                                    <path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6 C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19c0,0,0,0,0,0h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z" />
                                                    <path fill="#fff" d="M4.9,43.8c-0.1,0-0.3-0.1-0.4-0.1c-0.1-0.1-0.2-0.3-0.1-0.5L7,33.5c-1.6-2.9-2.5-6.2-2.5-9.6 C4.5,13.2,13.3,4.5,24,4.5c5.2,0,10.1,2,13.8,5.7c3.7,3.7,5.7,8.6,5.7,13.8c0,10.7-8.7,19.5-19.5,19.5c-3.2,0-6.3-0.8-9.1-2.3 L5,43.8C5,43.8,4.9,43.8,4.9,43.8z" />
                                                    <path fill="#cfd8dc" d="M24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3 L4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5 M24,43L24,43L24,43 M24,43L24,43L24,43 M24,4L24,4C13,4,4,13,4,24 c0,3.4,0.8,6.7,2.5,9.6L3.9,43c-0.1,0.3,0,0.7,0.3,1c0.2,0.2,0.4,0.3,0.7,0.3c0.1,0,0.2,0,0.3,0l9.7-2.5c2.8,1.5,6,2.2,9.2,2.2 c11,0,20-9,20-20c0-5.3-2.1-10.4-5.8-14.1C34.4,6.1,29.4,4,24,4L24,4z" />
                                                    <path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8 l6-1.6l0.6,0.3c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z" />
                                                    <path fill="#fff" fillRule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0 s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3 c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9 c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4c1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8 c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8C20.6,19.3,19.7,17,19.3,16z" clipRule="evenodd" />
                                                </button>
                                            )}
                                        </TableCell>
                                        <TableCell>{patient.email || '-'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <CardFooter>
                    <Pagination total={sortedPatients.length} page={effectivePage} pageSize={pageSize} onPageChange={setPage} />
                </CardFooter>
            </Card>
        </>
    );
}
