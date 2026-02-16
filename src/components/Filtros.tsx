import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { FlaskConical, Clock, CalendarCheck, Archive } from 'lucide-react';
import React from 'react';

type Filters = {
    paciente?: string;
    laboratorioId?: string;
    estado?: string;
};

interface FiltrosProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    labs?: Array<{ id: string; name: string }>;
    showPaciente?: boolean;
    showLaboratorio?: boolean;
    showEstado?: boolean;
    statuses?: string[];
}

export const Filtros: React.FC<FiltrosProps & { asCard?: boolean }> = ({
    filters,
    setFilters,
    labs = [],
    showPaciente = true,
    showLaboratorio = true,
    showEstado = true,
    statuses = [],
    asCard = true,
}) => {
    const content = (
        <div className="grid gap-4 sm:grid-cols-4">
            {showPaciente && (
                <div className="space-y-2">
                    <Label>Buscar</Label>
                    <Input
                        value={filters.paciente || ''}
                        onChange={(event) => setFilters((prev) => ({ ...prev, paciente: event.target.value }))}
                        placeholder="Buscar por nombre"
                    />
                </div>
            )}
            {showEstado && (
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
                            {statuses.map((status) => {
                                let color = '';
                                let icon = null;
                                switch (status) {
                                    case 'En laboratorio':
                                        color = 'text-yellow-600';
                                        icon = <FlaskConical className="h-3.5 w-3.5" />;
                                        break;
                                    case 'En clinica (sin citar)':
                                        color = 'text-orange-700';
                                        icon = <Clock className="h-3.5 w-3.5" />;
                                        break;
                                    case 'En clinica (citado)':
                                        color = 'text-purple-600';
                                        icon = <CalendarCheck className="h-3.5 w-3.5" />;
                                        break;
                                    case 'Cerrado':
                                        color = 'text-blue-600';
                                        icon = <Archive className="h-3.5 w-3.5" />;
                                        break;
                                    default:
                                        color = '';
                                }
                                return (
                                    <SelectItem key={status} value={status} className={color}>
                                        <span className="flex items-center gap-2">
                                            {icon}
                                            {status}
                                        </span>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>
            )}
            {showLaboratorio && (
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
            )}
        </div>
    );

    return asCard ? <Card className="border-slate-200 bg-white/80 p-5">{content}</Card> : content;
};
