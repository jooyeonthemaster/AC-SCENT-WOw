'use client'

import { ScentProfileCircle } from './ScentProfileCircle'
import type { Characteristics } from '@/lib/data/perfumes'

interface ScentProfileGridProps {
  characteristics: Characteristics
  accentColor: string
  circleSize?: number
}

const CATEGORIES: { key: keyof Characteristics; label: string }[] = [
  { key: 'citrus', label: 'Citrus' },
  { key: 'floral', label: 'Floral' },
  { key: 'woody', label: 'Woody' },
  { key: 'musky', label: 'Musky' },
  { key: 'fruity', label: 'Fruity' },
  { key: 'spicy', label: 'Spicy' },
]

export function ScentProfileGrid({
  characteristics,
  accentColor,
  circleSize = 40,
}: ScentProfileGridProps) {
  const sorted = [...CATEGORIES].sort((a, b) => (characteristics[b.key] ?? 0) - (characteristics[a.key] ?? 0))

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
      {sorted.map(({ key, label }, index) => (
        <ScentProfileCircle
          key={key}
          category={key}
          label={label}
          score={characteristics[key]}
          accentColor={accentColor}
          index={index}
          size={circleSize}
        />
      ))}
    </div>
  )
}
