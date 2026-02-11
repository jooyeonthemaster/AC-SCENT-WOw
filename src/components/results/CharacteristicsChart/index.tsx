'use client'

import { useMemo, useState, useEffect } from 'react'
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
          <PolarGrid stroke={perfume.secondaryColor} strokeOpacity={0.3} />
          <PolarAngleAxis
            dataKey="characteristic"
            tick={{ fill: '#374151', fontSize }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, CHART_CONFIG.fullMark]}
            tick={{ fill: '#6B7280', fontSize: tickFontSize }}
          />
          <Radar
            name="향의 특성"
            dataKey="value"
            stroke={perfume.secondaryColor}
            fill={perfume.primaryColor}
            fillOpacity={0.6}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
