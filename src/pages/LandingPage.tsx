import { Link } from 'react-router-dom'
import { ArrowDown, Check } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { LandingJobsTable } from '@/components/landing/LandingJobsTable'
import { HeroBackground } from '@/components/landing/HeroBackground'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { SeguimientoInteligente } from '@/components/landing/SeguimientoInteligente.tsx'
import { useInView } from '@/hooks/useInView'

const planFeatures = [
  {
    title: 'Ordenes de trabajo ilimitadas',
    description: 'Para que no se te quede ni un trabajo sin trackear',
  },
  {
    title: 'Gestión multi-especialista',
    description: 'Asigna a los doctores de la clínica a los trabajos',
  },
  {
    title: 'Base de datos de laboratorios',
    description: 'Gestiona tus proveedores en un solo lugar',
  },
  {
    title: 'Cumplimiento RGPD/LOPD',
    description: 'Los datos de tus pacientes están seguros',
  },
  {
    title: 'Soporte prioritario 24/7',
    description: 'Email o teléfono',
  },
  {
    title: 'Reducción de Errores',
    description: 'Evita citas fallidas por falta de material de laboratorio.',
  },
]

const testimonials = [
  {
    name: 'Dra. Marta Sánchez',
    role: 'Directora clínica · Clínica Dental Norte',
    photo: '/professional1.jpg',
    quote: 'Con Labtrack dejamos de perder tiempo en llamadas y ahora cada trabajo está claro para todo el equipo.',
  },
  {
    name: 'Dr. Javier Ruiz',
    role: 'Odontólogo · Clínica Sonrisa Viva',
    photo: '/professional2.jpg',
    quote: 'La trazabilidad de estados nos ayudó a reducir retrasos y dar fechas más fiables a los pacientes.',
  },
  {
    name: 'Paula Moreno',
    role: 'Gestora de clínica',
    photo: '/professional3.jpg',
    quote: 'Muy simple de usar. En una semana todo el equipo ya estaba trabajando dentro del mismo flujo.',
  },
  {
    name: 'Dra. Laura Gil',
    role: 'Especialista en prótesis',
    photo: '/professional4.jpg',
    quote: 'El panel único nos dio visibilidad real de carga y prioridades. Se nota en productividad diaria.',
  },
  {
    name: 'Dr. Carlos Herrera',
    role: 'Coordinador clínico',
    photo: '/professional5.jpg',
    quote: 'El primer mes gratis fue perfecto para validar el proceso. Nos quedamos porque funciona.',
  },
]

const testimonialsMarquee = [...testimonials, ...testimonials]

export const LandingPage = () => {
  const [planRef, planInView] = useInView<HTMLDivElement>({ threshold: 0.2 })

  return (
    <div className="min-h-screen bg-background text-slate-900 dark:bg-background dark:text-foreground">
      <header className="relative z-20 px-6 py-3 bg-transparent dark:bg-transparent">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo />
          <Button asChild className="bg-teal-600 text-white hover:bg-teal-500">
            <Link to="/login">Acceso</Link>
          </Button>
        </div>
      </header>

      <div className="relative">
        <section className="relative h-[500px] md:h-[600px] overflow-hidden bg-transparent dark:bg-transparent">
          <HeroBackground foreground height="600px" />
          <HeroBackground />
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center px-6 max-w-6xl leading-tight">
                <span style={{ color: '#545454' }}>Sincroniza tu clínica</span>{' '}
                <span style={{ color: '#14b8a6', textShadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 0 2px rgba(255, 255, 255, 0.8)' }}>con tus laboratorios y tus citas</span>
              </h1>
            </div>
            <div className="absolute left-1/2 top-1/2 mt-32 -translate-x-1/2 pointer-events-auto">
              <RainbowButton asChild>
                <Link to="/login?register=1">Pruébalo gratis</Link>
              </RainbowButton>
            </div>
          </div>
        </section>

        {/* Flecha entre hero y tablero */}
        <div className="absolute left-1/2 bottom-0 z-50 -translate-x-1/2 translate-y-1/2">
          <div className="group transition-transform duration-200 ease-out hover:scale-110">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-teal-200 bg-white shadow-lg group-hover:animate-bounce">
              <ArrowDown className="h-5 w-5 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de trabajos */}
      <section className="px-6 pt-32 bg-transparent">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-teal-600 mb-3">Tu tablero de trabajos</p>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
              Visualiza todas las órdenes de trabajo en un solo lugar
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Pacientes, estados, laboratorios y plazos en una tabla clara y accesible
            </p>
          </div>
          <div className="space-y-16">
            <LandingJobsTable />
            <SeguimientoInteligente />
          </div>
        </div>
      </section>

      <section className="px-6 pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-teal-600 mb-3">Plan</p>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Un único plan para todo lo que necesitas</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Pruébalo gratis y descubre cuantas horas de caos te puede ahorrar Labtrack
            </p>
          </div>

          <div ref={planRef}>
            <Card
              className={`plan-neon-card mx-auto max-w-3xl bg-card/95 backdrop-blur-sm transition-all duration-700 ${planInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
            >
              <CardContent className="p-8 sm:p-10">
                <div className="text-center">
                  <div>
                    <p className="text-xl font-semibold text-teal-600">Plan Premium</p>
                    <div className="mt-2 flex flex-wrap items-end justify-center gap-3">
                      <h3 className="text-2xl font-semibold">19,99€/mes</h3>
                      <p className="text-base text-slate-500 line-through">29,99€</p>
                    </div>
                    <div className="mt-1 text-center">
                      <p className="relative inline-block text-sm text-slate-600 dark:text-slate-300">
                        <span className="pointer-events-none absolute right-[90%] top-0 -translate-y-[120%] -rotate-6 whitespace-nowrap text-xs font-medium text-slate-400/90 dark:text-slate-500/90">
                          Sin tarjeta de crédito
                        </span>
                        Primer mes gratis, sin compromiso de permanencia
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {planFeatures.map((feature) => (
                    <div key={feature.title} className="flex items-start gap-2 rounded-lg border border-slate-200/70 p-3 dark:border-border">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40">
                        <Check className="h-3.5 w-3.5 text-teal-600" />
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        <span className="font-semibold">{feature.title}:</span> {feature.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <RainbowButton asChild>
                    <Link to="/login?register=1">Probar gratis</Link>
                  </RainbowButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-6 pt-32 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-teal-600 mb-3">Profesionales</p>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Lo que dicen nuestros usuarios</h2>
          </div>

          <div className="testimonials-marquee" aria-label="Testimonios en carrusel">
            <div className="testimonials-track">
              {testimonialsMarquee.map((testimonial, index) => (
                <Card key={`${testimonial.name}-${index}`} className="testimonials-item border-slate-200/80 bg-card/95">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <img
                        src={testimonial.photo}
                        alt={testimonial.name}
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-teal-200"
                      />
                      <div className="text-left">
                        <p className="text-sm font-semibold leading-tight">{testimonial.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">“{testimonial.quote}”</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
