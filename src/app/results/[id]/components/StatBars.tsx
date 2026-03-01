'use client'

import { motion } from 'framer-motion'
import { useMemo, useRef, useState, useEffect } from 'react'
import type { TraitScores } from '@/types/analysis'
import { TRAIT_LABELS, TRAIT_ICONS } from '@/types/analysis'

interface StatBarsProps {
  traits: TraitScores
}

const SHOW_COUNT = 5
const TOP_COUNT = 3
const STROKE_WIDTH = 4

export function StatBars({ traits }: StatBarsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [circleSize, setCircleSize] = useState(40)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const h = el.clientHeight
      const w = el.clientWidth
      // height-based: 60% of container for circle
      const fromH = Math.floor(h * 0.6)
      // width-based: each column gets w/5, circle is 80% of that
      const fromW = Math.floor((w / 5) * 0.8)
      const s = Math.min(fromH, fromW)
      setCircleSize(Math.max(20, s))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const radius = (circleSize - STROKE_WIDTH) / 2
  const circumference = 2 * Math.PI * radius

  const topTraits = useMemo(() => {
    return (Object.entries(traits) as [keyof TraitScores, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, SHOW_COUNT)
  }, [traits])

  return (
    <motion.div
      ref={containerRef}
      className="grid grid-cols-5 w-full h-full"
      style={{ alignItems: 'center', justifyItems: 'center' }}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {topTraits.map(([key, value], rank) => {
        const isTop = rank < TOP_COUNT
        const progress = value / 10
        const dashOffset = circumference * (1 - progress)
        const color = isTop ? '#BB0000' : '#555'

        return (
          <motion.div
            key={key}
            className="flex flex-col items-center"
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative flex items-center justify-center" style={{ width: circleSize, height: circleSize }}>
              <svg
                width={circleSize}
                height={circleSize}
                className="absolute top-0 left-0"
              >
                <circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  fill="none"
                  stroke="#F0F0F0"
                  strokeWidth={STROKE_WIDTH}
                />
                <motion.circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 0.8, delay: rank * 0.08, ease: 'easeOut' }}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              </svg>
              <div className="flex items-center justify-center z-[1]">
                <span style={{ fontSize: Math.max(16, circleSize * 0.5), color }} className="leading-none">{TRAIT_ICONS[key]}</span>
              </div>
            </div>

            <span
              className="font-semibold mt-0.5 text-center leading-tight"
              style={{ color, fontSize: Math.max(12, circleSize * 0.34) }}
            >
              {TRAIT_LABELS[key]}
            </span>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
