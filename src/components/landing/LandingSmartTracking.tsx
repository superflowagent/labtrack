import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FlaskConical, Hospital, CalendarCheck, CheckCircle2 } from 'lucide-react'

const checkpoints = [
  { label: 'Laboratorio', icon: FlaskConical, position: 0 },
  { label: 'En clínica (sin citar)', icon: Hospital, position: 33.33 },
  { label: 'En clínica (citado)', icon: CalendarCheck, position: 66.66 },
  { label: 'Cerrado', icon: CheckCircle2, position: 100 },
]

export const LandingSmartTracking = () => {
  const [progress, setProgress] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const scrollAccumulatorRef = useRef(0)
  const SCROLL_THRESHOLD = 2000 // Total scroll pixels needed to complete

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const viewportCenter = window.innerHeight / 2
      const isInView = rect.top <= viewportCenter && rect.bottom >= viewportCenter

      const shouldLockForward = e.deltaY > 0 && progress < 100
      const shouldLockBackward = e.deltaY < 0 && progress > 0

      if (isInView && (shouldLockForward || shouldLockBackward)) {
        e.preventDefault()

        // Accumulate scroll delta (upwards scroll rewinds progress)
        scrollAccumulatorRef.current += e.deltaY
        scrollAccumulatorRef.current = Math.max(
          0,
          Math.min(scrollAccumulatorRef.current, SCROLL_THRESHOLD)
        )
        const newProgress = Math.min(
          100,
          (scrollAccumulatorRef.current / SCROLL_THRESHOLD) * 100
        )
        setProgress(newProgress)

        // progress value controls behavior — no separate `isLocked` read is required
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [progress])


  return (
    <section
      ref={sectionRef}
      className="px-6 py-24 bg-transparent"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-teal-600 mb-3">
            Seguimiento inteligente
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
            Visualiza el progreso de cada trabajo
          </h2>

          {/* Barra de progreso SVG */}
          <div className="relative h-16 my-12">
            <svg width="1000" height="32" className="w-full h-8 absolute left-0 top-1/2 -translate-y-1/2">
              {(() => {
                // Definición de cortes y segmentos
                const barY = 16;
                const barHeight = 8;
                const cutWidth = 32;
                // Ejemplo de cortes, reemplazar por lógica real si aplica
                const cuts = checkpoints.slice(1, -1).map(cp => (cp.position / 100) * 1000);
                const segments = [];
                let last = 0;
                for (let i = 0; i < cuts.length; i++) {
                  const start = last;
                  const end = cuts[i] - cutWidth / 2;
                  if (end > start) {
                    segments.push(
                      <rect
                        key={i}
                        x={start}
                        y={barY - barHeight / 2}
                        width={end - start}
                        height={barHeight}
                        rx={2}
                        fill="#e2e8f0"
                        className="dark:fill-slate-700"
                      />
                    );
                  }
                  last = cuts[i] + cutWidth / 2;
                }
                // Segmento final
                if (last < 1000) {
                  segments.push(
                    <rect
                      key="final"
                      x={last}
                      y={barY - barHeight / 2}
                      width={1000 - last}
                      height={barHeight}
                      rx={2}
                      fill="#e2e8f0"
                      className="dark:fill-slate-700"
                    />
                  );
                }
                return segments;
              })()}
            </svg>
          </div>

          {/* Animated progress line */}
          <motion.div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-teal-500 to-teal-400 -translate-y-1/2 rounded-full shadow-lg"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />

          {/* Checkpoints */}
          <div className="relative h-40">
            <div className="absolute inset-0 flex items-center justify-between">
              {checkpoints.map((checkpoint, index) => {
                const Icon = checkpoint.icon
                const isActive = progress >= checkpoint.position
                const isCurrentCheckpoint =
                  progress >= checkpoint.position &&
                  (index === checkpoints.length - 1 ||
                    progress < checkpoints[index + 1].position)

                return (
                  <motion.div
                    key={checkpoint.label}
                    className="flex items-center justify-center z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: isActive ? 1 : 0.4,
                      y: 0,
                      scale: isCurrentCheckpoint ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    <motion.div
                      className={`flex items-center justify-center w-20 h-20 rounded-full border-4 transition-colors ${isActive
                        ? 'bg-teal-500 border-teal-400 shadow-lg shadow-teal-200 dark:shadow-teal-900'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600'
                        }`}
                      animate={{
                        boxShadow: isActive
                          ? '0 0 0 8px rgba(20, 184, 166, 0.1)'
                          : '0 0 0 0px rgba(20, 184, 166, 0)',
                      }}
                    >
                      <Icon
                        className={`w-8 h-8 ${isActive ? 'text-white' : 'text-slate-300 dark:text-slate-500'
                          }`}
                      />
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>

            <div className="absolute left-0 right-0 top-1/2 translate-y-14 flex justify-between">
              {checkpoints.map((checkpoint) => {
                const isActive = progress >= checkpoint.position

                return (
                  <p
                    key={`${checkpoint.label}-label`}
                    className={`mt-3 w-20 text-sm font-medium text-center transition-colors ${isActive
                      ? 'text-slate-900 dark:text-slate-100'
                      : 'text-slate-500 dark:text-slate-400'
                      }`}
                  >
                    {checkpoint.label}
                  </p>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </section >
  )
}
