import React, { useEffect, useRef, useState } from 'react'

/**
 * Full-hero canvas background with gravity-based interaction.
 * - Respects prefers-reduced-motion and is pointer-events: none (visual only).
 * - Reads app palette from CSS variables when available.
 */
type HeroBackgroundProps = { foreground?: boolean; height?: string | number }
export const HeroBackground: React.FC<HeroBackgroundProps> = ({ foreground = false, height = '420px' }) => {
    const rootRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const rafRef = useRef<number | null>(null)
    const [reducedMotion, setReducedMotion] = useState(false)

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        const onChange = () => setReducedMotion(!!mq.matches)
        onChange()
        mq.addEventListener?.('change', onChange)
        return () => mq.removeEventListener?.('change', onChange)
    }, [])

    useEffect(() => {
        if (reducedMotion) return
        const el = rootRef.current!
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!

        let width = 0
        let height = 0
        let dpr = Math.max(1, window.devicePixelRatio || 1)

        type Particle = { x: number; y: number; vx: number; vy: number; r: number; color: string; mass: number }
        const particles: Particle[] = []

        const pointer = { x: -9999, y: -9999, active: false }

        function resize() {
            width = Math.max(320, el.clientWidth)
            height = Math.max(220, el.clientHeight)
            dpr = Math.max(1, window.devicePixelRatio || 1)
            canvas.width = Math.floor(width * dpr)
            canvas.height = Math.floor(height * dpr)
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }

        function rand(min: number, max: number) {
            return Math.random() * (max - min) + min
        }

        function initParticles() {
            particles.length = 0
            const count = Math.max(720, Math.floor((width * height) / (foreground ? 1333 : 2500)))
            const particleRadius = foreground ? 3 : 5
            const particleColor = '#14b8a6'
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: rand(particleRadius, width - particleRadius),
                    y: rand(particleRadius, height - particleRadius),
                    vx: rand(-0.2, 0.2),
                    vy: rand(-0.2, 0.2),
                    r: particleRadius,
                    color: particleColor,
                    mass: particleRadius * 0.08,
                })
            }
        }

        function applyPhysics(dt: number) {
            const G = foreground ? 80000 : 40000
            const softening = 10
            const brownianStrength = 15.0 // random drift force
            const centerRecovery = 0.35 // pull towards center when pointer inactive
            const longRangeRadius = foreground ? 2000 : 2500 // detection radius
            const longRangeForce = foreground ? 8.0 : 4.0 // constant force at long range

            const centerX = width / 2
            const centerY = height / 2

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i]

                // brownian motion — strong random continuous drift
                p.vx += rand(-brownianStrength, brownianStrength) * dt
                p.vy += rand(-brownianStrength, brownianStrength) * dt

                // attraction to pointer when active
                if (pointer.active) {
                    const dx = pointer.x - p.x
                    const dy = pointer.y - p.y
                    const distRaw = Math.sqrt(dx * dx + dy * dy)
                    const dist = distRaw || 1

                    let force
                    if (dist > longRangeRadius) {
                        // Long range: constant force (particles detect cursor from far away)
                        force = longRangeForce * p.mass
                    } else {
                        // Short/medium range: strong gravitational pull
                        const dist2 = dx * dx + dy * dy + softening
                        force = (G * p.mass) / dist2
                    }

                    p.vx += (dx / dist) * force * dt
                    p.vy += (dy / dist) * force * dt
                } else {
                    // recovery: gently pull particles back towards center when cursor is away
                    const dx = centerX - p.x
                    const dy = centerY - p.y
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1
                    p.vx += (dx / dist) * centerRecovery * dt
                    p.vy += (dy / dist) * centerRecovery * dt
                }

                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j]
                    const dx = q.x - p.x
                    const dy = q.y - p.y
                    const dist = Math.sqrt(dx * dx + dy * dy) || 0.001
                    const minDist = p.r + q.r
                    if (dist < minDist) {
                        const overlap = (minDist - dist) / 2
                        const nx = (dx / dist) * overlap
                        const ny = (dy / dist) * overlap
                        p.x -= nx
                        p.y -= ny
                        q.x += nx
                        q.y += ny
                        const vx = (p.vx + q.vx) * 0.5
                        const vy = (p.vy + q.vy) * 0.5
                        p.vx = vx
                        q.vx = vx
                        p.vy = vy
                        q.vy = vy
                    }
                }

                const margin = 16
                if (p.x < margin + p.r) p.vx += (margin + p.r - p.x) * 0.02
                if (p.x > width - margin - p.r) p.vx -= (p.x - (width - margin - p.r)) * 0.02
                if (p.y < margin + p.r) p.vy += (margin + p.r - p.y) * 0.02
                if (p.y > height - margin - p.r) p.vy -= (p.y - (height - margin - p.r)) * 0.02

                p.vx *= 0.75
                p.vy *= 0.75
                p.x += p.vx * dt * 60
                p.y += p.vy * dt * 60
            }
        }

        function draw() {
            ctx.clearRect(0, 0, width, height)

            for (const p of particles) {
                ctx.fillStyle = p.color
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fill()
            }
        }

        let last = performance.now()
        function frame(now: number) {
            const dt = Math.min(0.05, (now - last) / 1000)
            last = now
            applyPhysics(dt)
            draw()
            rafRef.current = requestAnimationFrame(frame)
        }

        function onPointerMove(e: PointerEvent) {
            const rect = canvas.getBoundingClientRect()
            pointer.x = e.clientX - rect.left
            pointer.y = e.clientY - rect.top
            pointer.active = true
        }
        function onPointerLeave() {
            pointer.active = false
            pointer.x = -9999
            pointer.y = -9999
        }

        function start() {
            resize()
            initParticles()
            last = performance.now()
            rafRef.current = requestAnimationFrame(frame)
            window.addEventListener('resize', onWindowResize)
            canvas.addEventListener('pointermove', onPointerMove)
            canvas.addEventListener('pointerleave', onPointerLeave)
        }

        function onWindowResize() {
            resize()
            initParticles()
        }

        start()

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            window.removeEventListener('resize', onWindowResize)
            canvas.removeEventListener('pointermove', onPointerMove)
            canvas.removeEventListener('pointerleave', onPointerLeave)
        }
    }, [reducedMotion, foreground])

    // Render nothing (visual only) when reduced motion is preferred
    return (
        <div
            ref={rootRef}
            className={foreground ? 'relative w-full' : 'absolute inset-0 -z-10 pointer-events-none'}
            style={foreground ? { height: typeof height === 'number' ? `${height}px` : height } : undefined}
        >
            {!reducedMotion && <canvas ref={canvasRef} className="w-full h-full block" />}
        </div>
    )
}
