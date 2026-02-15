import { Stethoscope } from 'lucide-react'

export const Logo = () => (
  <div className="flex items-center gap-2 text-teal-700">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100">
      <Stethoscope className="h-5 w-5" aria-hidden />
    </div>
    <div className="leading-tight">
      <div className="text-base font-semibold">DentLab</div>
      <div className="text-xs text-teal-600">Tracking odontologico</div>
    </div>
  </div>
)
