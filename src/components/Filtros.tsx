import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import React from 'react';

interface FiltrosProps {
    filters: {
        paciente?: string;
        laboratorioId?: string;
        estado?: string;
    };
    setFilters: (fn: (prev: any) => any) => void;
    labs?: Array<{ id: string; name: string }>;
    showPaciente?: boolean;
    showLaboratorio?: boolean;
    showEstado?: boolean;
    statuses?: string[];
}

export const Filtros: React.FC<FiltrosProps> = ({
    filters,
    setFilters,
    labs = [],
    showPaciente = true,
    showLaboratorio = true,
    showEstado = true,
    statuses = [],
}) => (
    <Card className="mt-8 border-slate-200 bg-white/80 p-5">
        <div className="grid gap-4 sm:grid-cols-4">
            {showPaciente && (
                <div className="space-y-2">
                    <Label>Paciente</Label>
                    <Input
                        value={filters.paciente || ''}
                        onChange={(event) => setFilters((prev: any) => ({ ...prev, paciente: event.target.value }))}
                        placeholder="Buscar por nombre"
                    />
                </div>
            )}
            {showEstado && (
                <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select
                        value={filters.estado}
                        onValueChange={(value) => setFilters((prev: any) => ({ ...prev, estado: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {statuses.map((status) => {
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
            )}
            {showLaboratorio && (
                <div className="space-y-2">
                    <Label>Laboratorio</Label>
                    <Select
                        value={filters.laboratorioId}
                        onValueChange={(value) => setFilters((prev: any) => ({ ...prev, laboratorioId: value }))}
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
    </Card>
);
