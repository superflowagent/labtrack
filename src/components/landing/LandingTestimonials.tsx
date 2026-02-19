import React from 'react'

const testimonials = [
    { name: 'Paula Moreno', role: 'Gestora de clínica', quote: 'Muy simple de usar. En un par de días el equipo completo ya estaba usando Labtrack para controlar los trabajos de la clínica.' },
    { name: 'Dr. Carlos Herrera', role: 'Coordinador clínico', quote: 'Teníamos dudas de si nos iba a servir pero el primer mes gratis fue perfecto para validar el proceso. Nos quedamos porque es justo lo que necesitábamos.' },
    { name: 'Dr. Javier Ruiz', role: 'Odontólogo · Clínica Sonrisa Viva', quote: 'En nuestra clínica era habitual cada cierto tiempo sufrir algún error con la trazabilidad de trabajos. Desde que usamos Labtrack, no ha habido ni un solo problema.' },
    { name: 'Dra. Laura Gil', role: 'Especialista en prótesis', quote: 'Nos sería imposible controlar todos los trabajos de todos los laboratorios sin Labtrack. El equipo está encantado.' },
    { name: 'Dra. Marta Sánchez', role: 'Directora clínica · Clínica Dental Norte', quote: 'Con Labtrack dejamos de perder tiempo en llamadas y ahora cada trabajo está claro para todo el equipo.' },
]

export const LandingTestimonials: React.FC = () => {
    return (
        <section className="mt-12 bg-transparent">
            <h2 className="text-2xl font-semibold">Lo que dicen las clínicas</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {testimonials.map((t) => (
                    <div key={t.name} className="rounded-lg border bg-white/60 dark:bg-card/60 p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-teal-50 text-teal-700 font-semibold">{t.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
                            <div>
                                <div className="text-sm font-semibold">{t.name}</div>
                                <div className="text-xs text-slate-500">{t.role}</div>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">"{t.quote}"</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default LandingTestimonials
