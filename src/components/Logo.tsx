export const Logo = ({ centered = false }: { centered?: boolean }) => (
  <div className={`flex items-center gap-2 text-teal-700 ${centered ? 'justify-center' : ''}`}>
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100">
      <img src="/favicon.svg" alt="Labtrack logo" className="h-8 w-8" />
    </div>
    <div className="text-2xl font-bold">
      <span style={{ color: '#545454' }}>Lab</span>
      <span style={{ color: '#14b8a6' }}>track</span>
    </div>
  </div>
)
