import { useMemo, useState, useRef } from 'react';
import { Card, CardFooter } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Laboratory, Patient, Specialist } from '@/types/domain';
import { normalizeSearch } from '@/lib/utils';

// Props: labs: Laboratory[]
export function LaboratoriesTable({ labs, filter, onEdit, asCard = true }: { labs: Laboratory[]; filter?: string; onEdit?: (lab: Laboratory) => void; asCard?: boolean }) {
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
    const pageSize = 50;
    const labsTableRef = useRef<HTMLTableElement | null>(null);

    const labsTotalPages = Math.max(1, Math.ceil(sortedLabs.length / pageSize));
    const effectivePage = Math.min(page, labsTotalPages);

    const paginatedLabs = useMemo(() => {
        const start = (effectivePage - 1) * pageSize;
        return sortedLabs.slice(start, start + pageSize);
    }, [sortedLabs, effectivePage, pageSize]);



    const handleSort = (col: 'name' | 'phone' | 'email') => {
        if (sortBy === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortBy(col);
            setSortDir('asc');
        }
    };

    return (
        <>
            {asCard ? (
                <Card className="border-slate-200 bg-white flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="p-0 flex-1 min-h-0">
                        <Table ref={labsTableRef}>
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
            ) : (
                <>
                    <div className="p-0 flex-1 min-h-0">
                        <Table ref={labsTableRef}>
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
                </>
            )}
        </>
    );
}

// Props: specialists: Specialist[]
export function SpecialistsTable({ specialists, filter, onEdit, asCard = true }: { specialists: Specialist[]; filter?: string; onEdit?: (spec: Specialist) => void; asCard?: boolean }) {
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
    const pageSize = 50;
    const specsTableRef = useRef<HTMLTableElement | null>(null);

    const specsTotalPages = Math.max(1, Math.ceil(sortedSpecs.length / pageSize));
    const effectivePage = Math.min(page, specsTotalPages);

    const paginatedSpecs = useMemo(() => {
        const start = (effectivePage - 1) * pageSize;
        return sortedSpecs.slice(start, start + pageSize);
    }, [sortedSpecs, effectivePage, pageSize]);



    const handleSort = (col: 'name' | 'specialty') => {
        if (sortBy === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortBy(col);
            setSortDir('asc');
        }
    };

    return (
        <>
            {asCard ? (
                <Card className="border-slate-200 bg-white flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="p-0 flex-1 min-h-0">
                        <Table ref={specsTableRef}>
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
            ) : (
                <>
                    <div className="p-0 flex-1 min-h-0">
                        <Table ref={specsTableRef}>
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
                </>
            )}
        </>
    );
}

export function PatientsTable({ patients, filter, onEdit, asCard = true }: { patients: Patient[]; filter?: string; onEdit?: (patient: Patient) => void; asCard?: boolean }) {
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
    const pageSize = 50;
    const patientsTableRef = useRef<HTMLTableElement | null>(null);

    const patientsTotalPages = Math.max(1, Math.ceil(sortedPatients.length / pageSize));
    const effectivePage = Math.min(page, patientsTotalPages);

    const paginatedPatients = useMemo(() => {
        const start = (effectivePage - 1) * pageSize;
        return sortedPatients.slice(start, start + pageSize);
    }, [sortedPatients, effectivePage, pageSize]);



    const handleSort = (col: 'name' | 'phone' | 'email') => {
        if (sortBy === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortBy(col);
            setSortDir('asc');
        }
    };

    return (
        <>
            {asCard ? (
                <Card className="border-slate-200 bg-white flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="p-0 flex-1 min-h-0">
                        <Table ref={patientsTableRef}>
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
            ) : (
                <>
                    <div className="p-0 flex-1 min-h-0">
                        <Table ref={patientsTableRef}>
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
                </>
            )}
        </>
    );
}
