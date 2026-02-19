import { useEffect, useRef, useState } from 'react'

export function useInView<T extends HTMLElement = HTMLElement>(options?: IntersectionObserverInit) {
    const ref = useRef<T | null>(null)
    const [inView, setInView] = useState(false)
    const serializedOptions = JSON.stringify(options)

    useEffect(() => {
        if (typeof window === 'undefined') return

        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // set asynchronously to avoid sync setState inside effect
            requestAnimationFrame(() => setInView(true))
            return
        }

        const parsedOptions = serializedOptions ? (JSON.parse(serializedOptions) as IntersectionObserverInit) : undefined
        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), parsedOptions || { threshold: 0.1 })
        const el = ref.current
        if (!el) return () => observer.disconnect()
        observer.observe(el)
        return () => observer.disconnect()
    }, [serializedOptions])

    return [ref, inView] as const
}

export default useInView
