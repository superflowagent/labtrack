import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList, Stethoscope, Timer } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { LandingDashboardPreview } from '@/components/landing/LandingDashboardPreview'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingPricing } from '@/components/landing/LandingPricing'
import { LandingTestimonials } from '@/components/landing/LandingTestimonials'
import { LandingFooter } from '@/components/landing/LandingFooter'

const features = [
  {
    title: 'Seguimiento claro',
    description: 'Cada trabajo con estado, responsable y fecha en un solo lugar.',
    icon: ClipboardList,
  },
  {
    title: 'Agenda sin fricciones',
    description: 'Filtra por laboratorio o paciente y decide en segundos.',
    icon: Timer,
  },
  {
    title: 'Equipo alineado',
    description: 'Especialistas y clínica trabajan con la misma información.',
    icon: Stethoscope,
  },
]

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-background dark:text-foreground">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(13,148,136,0.10),_transparent_55%)]" />
        <div className="absolute -right-20 top-16 h-72 w-72 rounded-full bg-teal-100/40 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-cyan-100/20 blur-3xl" />

        <header className="relative z-10 px-6 pt-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Logo />
            <Button asChild className="bg-teal-600 text-white hover:bg-teal-500">
              <Link to="/login">Acceso</Link>
            </Button>
          </div>
        </header>

        <main className="relative z-10 px-6 pb-24 pt-16">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-teal-600">Labtrack SaaS</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                Control total del flujo entre clínica y laboratorio
              </h1>
              <p className="mt-4 text-lg text-slate-700 dark:text-slate-200">
                Digitaliza tus trabajos odontológicos con un tablero simple, filtros rápidos y
                estados estandarizados.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-teal-600 text-white hover:bg-teal-500">
                  <Link to="/login?register=1" className="flex items-center gap-2">
                    Empezar ahora <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-100/60">
                  <Link to="/dashboard">Ver dashboard</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-6 sm:grid-cols-3">
                {features.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:bg-card dark:border-border">
                      <Icon className="h-5 w-5 text-teal-600" />
                      <h3 className="mt-3 text-base font-semibold">{feature.title}</h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <LandingDashboardPreview />
          </div>
        </main>
        <div className="mx-auto max-w-6xl px-6 pb-24">
          <LandingHowItWorks />
          <LandingPricing />
          <LandingTestimonials />
        </div>
        <LandingFooter />
      </div>
    </div>
  )
}
