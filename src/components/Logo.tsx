type LogoProps = { centered?: boolean }

export const Logo = ({ centered = false }: LogoProps) => (
  <div className={`flex flex-col ${centered ? 'items-center' : 'items-start'} text-teal-700`}>
    <div className="flex items-center gap-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100">
        <img src="/favicon.svg" alt="Labtrack logo" className="h-8 w-8" />
      </div>
      <div className="text-2xl font-bold">
        <span style={{ color: '#545454' }}>Lab</span>
        <span style={{ color: '#14b8a6' }}>track</span>
      </div>
    </div>
    <div className={`mt-2 text-sm text-teal-600 ${centered ? 'text-center' : 'text-left'}`}>
      <span>Seguimiento de órdenes de trabajo odontológicas</span>
    </div>
  </div>
)
