import React from 'react'

const testimonials = [
    { name: 'Dra. Laura Méndez', role: 'Clínica Central', quote: 'Desde que usamos Labtrack hemos reducido errores en la entrega y ahorrado 2 días de gestión al mes.' },
    { name: 'Dr. Javier Ruiz', role: 'Centro Dental Ruiz', quote: 'La visibilidad en tiempo real con el dashboard facilita citas y evita reenvíos al laboratorio.' },
    { name: 'Ana Torres', role: 'Clínica Sonrisa', quote: 'Organización, rapidez y comunicación con nuestros laboratorios. Imprescindible.' },
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
