import React, { useState } from 'react'
import { Filtros } from '@/components/Filtros'
import { Calendar } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'
import { landingLabs } from '@/lib/landingDemo'
import useInView from '@/hooks/useInView'

export const LandingHowItWorks: React.FC = () => {
    const [filters, setFilters] = useState<{ paciente?: string; laboratorioId?: string }>({})
    const [ref, inView] = useInView({ threshold: 0.2 })

    return (
        <section ref={ref} className={`mt-16 grid gap-8 sm:grid-cols-3 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700`}>
            <div>
                <h3 className="text-xl font-semibold">1. Crear orden</h3>
                <p className="text-sm text-slate-600 mt-2">Rellena los datos en segundos y envía al laboratorio.</p>
                <Card className="mt-4 p-4">
                    <input className="w-full rounded border p-2 bg-transparent" placeholder="Paciente, trabajo..." disabled value="Prótesis fija — Juan Pérez" />
                </Card>
            </div>

            <div>
                <h3 className="text-xl font-semibold">2. Filtrar y programar</h3>
                <p className="text-sm text-slate-600 mt-2">Filtra por estado o laboratorio para decidir rápido.</p>
                <div className="mt-4">
                    <Filtros filters={filters} setFilters={setFilters} labs={landingLabs} />
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold">3. Comunicar y cerrar</h3>
                <p className="text-sm text-slate-600 mt-2">Contacta al laboratorio y actualiza el estado en un click.</p>
                <div className="mt-4 w-fit">
                    <Calendar />
                </div>
            </div>
        </section>
    )
}

export default LandingHowItWorks
