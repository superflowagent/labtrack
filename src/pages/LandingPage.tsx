import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList, Stethoscope, Timer } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'

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
    description: 'Especialistas y clinica trabajan con la misma informacion.',
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
              <p className="text-sm uppercase tracking-[0.3em] text-teal-600">DentLab SaaS</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                Control total del flujo entre clinica y laboratorio
              </h1>
              <p className="mt-4 text-lg text-slate-700 dark:text-slate-200">
                Digitaliza tus trabajos odontologicos con un tablero simple, filtros rapidos y
                estados estandarizados.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-teal-600 text-white hover:bg-teal-500">
                  <Link to="/login" className="flex items-center gap-2">
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

            <div className="relative">
              <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-teal-100/40 via-slate-100 to-cyan-100/20 dark:from-teal-500/20 dark:via-background dark:to-cyan-400/10" />
              <div className="relative rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-2xl dark:bg-card dark:border-border">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600 dark:text-slate-300">Dashboard</div>
                  <div className="flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-400" />
                    <span className="h-2 w-2 rounded-full bg-cyan-300" />
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    ['Protesis fija', 'Laboratorio DentaLab', 'En laboratorio', 'text-blue-600'],
                    ['Carilla estetica', 'SmileCraft', 'En clinica (citado)', 'text-green-600'],
                    ['Puente superior', 'OrtoLab', 'En clinica (sin citar)', 'text-yellow-600'],
                  ].map(([job, lab, status, color]) => (
                    <div
                      key={job}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:bg-background dark:border-border"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{job}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{lab}</p>
                      </div>
                      <span className={`rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 ${color}`}>
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
