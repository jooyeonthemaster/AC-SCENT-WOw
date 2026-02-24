'use client'

import { useMemo } from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { mapCharacteristicsToChartData } from './utils/chartDataMapper'
import { CHART_CONFIG } from './constants'
import type { CharacteristicsChartProps } from './types'

export function CharacteristicsChart({ perfume }: CharacteristicsChartProps) {
  const isMobile = true

  const data = useMemo(
    () => mapCharacteristicsToChartData(perfume),
    [perfume]
  )

  const chartHeight = isMobile ? CHART_CONFIG.heightMobile : CHART_CONFIG.height
  const fontSize = isMobile ? 11 : 14
  const tickFontSize = isMobile ? 10 : 12

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <RadarChart data={data}>
          <PolarGrid stroke="#E0D0F0" strokeWidth={1.5} />
          <PolarAngleAxis
            dataKey="characteristic"
            tick={{ fill: '#5D4E6D', fontSize, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, CHART_CONFIG.fullMark]}
            tick={{ fill: '#8B7B9B', fontSize: tickFontSize }}
          />
          <Radar
            name="향의 특성"
            dataKey="value"
            stroke="#D4A5FF"
            fill="#FFB3E5"
            fillOpacity={0.6}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
