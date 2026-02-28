'use client'

import { motion } from 'framer-motion'
const CATEGORY_EMOJI: Record<string, string> = {
  citrus: '🍋',
  floral: '🌸',
  woody: '🌲',
  musky: '🫧',
  fruity: '🍑',
  spicy: '🌶️',
}

const cardFont = { fontFamily: '"Poppins", "Noto Sans KR", sans-serif' } as const

interface ScentProfileCircleProps {
  category: string
  label: string
  score: number
  accentColor: string
  index: number
  size?: number
}

const STROKE_WIDTH = 3

export function ScentProfileCircle({
  category,
  label,
  score,
  accentColor,
  index,
  size = 40,
}: ScentProfileCircleProps) {
  const radius = (size - STROKE_WIDTH) / 2
  const center = size / 2
  const circumference = 2 * Math.PI * radius
  const progress = score / 10
  const dashOffset = circumference * (1 - progress)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#F0F0F0"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Progress ring */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.8, delay: 0.3 + index * 0.08, ease: 'easeOut' }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        {/* Category emoji */}
        <span style={{
          position: 'relative',
          zIndex: 1,
          fontSize: size * 0.4,
          lineHeight: 1,
        }}>
          {CATEGORY_EMOJI[category] ?? '?'}
        </span>
      </div>
      {/* Category label */}
      <span style={{
        fontSize: 8,
        color: '#000',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        ...cardFont,
      }}>
        {label}
      </span>
    </div>
  )
}
