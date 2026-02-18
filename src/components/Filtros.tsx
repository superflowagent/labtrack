import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import React from 'react';

type Filters = {
    paciente?: string;
    laboratorioId?: string;
};

interface FiltrosProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    labs?: Array<{ id: string; name: string }>;
    showPaciente?: boolean;
    showLaboratorio?: boolean;
}

export const Filtros: React.FC<FiltrosProps & { asCard?: boolean }> = ({
    filters,
    setFilters,
    labs = [],
    showPaciente = true,
    showLaboratorio = true,
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
