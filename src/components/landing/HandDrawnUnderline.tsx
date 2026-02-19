import { useMemo } from 'react'
import getStroke from 'perfect-freehand'

type Point = [number, number, number]

const getSvgPathFromStroke = (stroke: number[][]): string => {
  if (!stroke.length) return ''

  const d = stroke.reduce((acc, [x0, y0], index, array) => {
    const [x1, y1] = array[(index + 1) % array.length]
    acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
    return acc
  }, ['M', ...stroke[0], 'Q'] as (string | number)[])

  d.push('Z')
  return d.join(' ')
}

const buildUnderlineStroke = (): string => {
  const totalPoints = 26
  const points: Point[] = Array.from({ length: totalPoints }, (_, index) => {
    const progress = index / (totalPoints - 1)
    const x = 4 + progress * 192
    const arc = Math.sin(progress * Math.PI) * 10
    const wobble = Math.sin(progress * 14) * 0.8
    const y = 26 - arc + wobble
    const pressure = 1 - Math.pow(progress, 1.35) * 0.82

    return [x, y, pressure]
  })

  const stroke = getStroke(points, {
    size: 11,
    thinning: 0.85,
    smoothing: 0.72,
    streamline: 0.3,
    easing: (t: number) => t,
    start: { taper: 0 },
    end: { taper: 34, easing: (t: number) => t * t },
    simulatePressure: false,
  })

  return getSvgPathFromStroke(stroke)
}

export const HandDrawnUnderline = () => {
  const path = useMemo(buildUnderlineStroke, [])

  return (
    <svg
      className="scribble"
      viewBox="0 0 200 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={path} fill="currentColor" opacity="0.95" />
    </svg>
  )
}
