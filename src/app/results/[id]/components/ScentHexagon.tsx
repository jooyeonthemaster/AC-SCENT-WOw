'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'
import type { ScentCategoryScores } from '@/types/analysis'
import { CHARACTERISTIC_LABELS, CATEGORY_INFO } from '@/types/analysis'

interface ScentHexagonProps {
  characteristics: ScentCategoryScores
}

const AXES: (keyof ScentCategoryScores)[] = ['citrus', 'floral', 'woody', 'musky', 'fruity', 'spicy']
const CENTER = 110
const MAX_RADIUS = 80
const GRID_STEPS = [0.2, 0.4, 0.6, 0.8, 1.0]

const CATEGORY_COLORS: Record<string, string> = {
  citrus: '#facc15',
  floral: '#f472b6',
  woody: '#d97706',
  musky: '#c084fc',
  fruity: '#f87171',
  spicy: '#f97316',
}

function getHexagonPoints(radius: number): string {
  return AXES.map((_, i) => {
    const angle = -Math.PI / 2 + i * (Math.PI * 2) / 6
    const x = CENTER + radius * Math.cos(angle)
    const y = CENTER + radius * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')
}

function getDataPoints(scores: ScentCategoryScores): string {
  return AXES.map((key, i) => {
    const score = scores[key] || 0
    const radius = (score / 10) * MAX_RADIUS
    const angle = -Math.PI / 2 + i * (Math.PI * 2) / 6
    const x = CENTER + radius * Math.cos(angle)
    const y = CENTER + radius * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')
}

export function ScentHexagon({ characteristics }: ScentHexagonProps) {
  const dataPoints = useMemo(() => getDataPoints(characteristics), [characteristics])

  return (
    <div>
      {/* Hexagonal Radar Chart */}
      <motion.div
        className="flex justify-center mb-5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
      >
        <svg width="220" height="220" viewBox="0 0 220 220">
          <defs>
            <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BB0000" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="hexStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BB0000" />
              <stop offset="100%" stopColor="#FF6B6B" />
            </linearGradient>
            <filter id="hexGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid hexagons */}
          {GRID_STEPS.map((step) => (
            <polygon
              key={step}
              points={getHexagonPoints(MAX_RADIUS * step)}
              fill="none"
              stroke="#E8E8E8"
              strokeWidth="0.7"
            />
          ))}

          {/* Axis lines */}
          {AXES.map((_, i) => {
            const angle = -Math.PI / 2 + i * (Math.PI * 2) / 6
            const x2 = CENTER + MAX_RADIUS * Math.cos(angle)
            const y2 = CENTER + MAX_RADIUS * Math.sin(angle)
            return (
              <line key={i} x1={CENTER} y1={CENTER} x2={x2} y2={y2} stroke="#E8E8E8" strokeWidth="0.7" />
            )
          })}

          {/* Data polygon */}
          <motion.polygon
            points={dataPoints}
            fill="url(#hexGrad)"
            stroke="url(#hexStroke)"
            strokeWidth="2.5"
            filter="url(#hexGlow)"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { delay: 0.3, duration: 0.8 } },
            }}
          />

          {/* Data point dots */}
          {AXES.map((key, i) => {
            const score = characteristics[key] || 0
            const radius = (score / 10) * MAX_RADIUS
            const angle = -Math.PI / 2 + i * (Math.PI * 2) / 6
            const x = CENTER + radius * Math.cos(angle)
            const y = CENTER + radius * Math.sin(angle)
            return (
              <motion.circle
                key={key}
                cx={x}
                cy={y}
                r="4"
                fill={CATEGORY_COLORS[key]}
                stroke="#fff"
                strokeWidth="2"
                variants={{
                  hidden: { opacity: 0, r: 0 },
                  visible: { opacity: 1, r: 4 },
                }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }}
              />
            )
          })}

          {/* Labels with emoji and score */}
          {AXES.map((key, i) => {
            const angle = -Math.PI / 2 + i * (Math.PI * 2) / 6
            const labelRadius = MAX_RADIUS + 22
            const x = CENTER + labelRadius * Math.cos(angle)
            const y = CENTER + labelRadius * Math.sin(angle)
            const score = characteristics[key] || 0
            const info = CATEGORY_INFO[key]
            return (
              <g key={key}>
                <text
                  x={x}
                  y={y - 6}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                >
                  {info?.icon}
                </text>
                <text
                  x={x}
                  y={y + 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill={CATEGORY_COLORS[key]}
                >
                  {CHARACTERISTIC_LABELS[key]} {score}
                </text>
              </g>
            )
          })}
        </svg>
      </motion.div>

      {/* Category cards - horizontal scroll */}
      <motion.div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06 } },
        }}
      >
        {AXES.map((key) => {
          const score = characteristics[key] || 0
          const info = CATEGORY_INFO[key]
          const color = CATEGORY_COLORS[key]

          return (
            <motion.div
              key={key}
              className="flex-shrink-0 flex flex-col items-center rounded-lg px-2.5 py-2"
              style={{
                backgroundColor: `${color}10`,
                border: `1px solid ${color}30`,
                minWidth: 56,
              }}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.25 }}
            >
              <span className="text-base">{info?.icon}</span>
              <span className="text-[10px] font-bold mt-0.5" style={{ color }}>{score}</span>
              <span className="text-[8px] text-[#888] font-medium">{CHARACTERISTIC_LABELS[key]}</span>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
