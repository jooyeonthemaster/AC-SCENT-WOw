'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { mapTraitsToChartData } from './utils/chartDataMapper'
import { CHART_CONFIG } from './constants'
import type { TraitsChartProps } from './types'

export function TraitsChart({ perfume }: TraitsChartProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const data = useMemo(() => mapTraitsToChartData(perfume), [perfume])

  const chartHeight = isMobile ? CHART_CONFIG.heightMobile : CHART_CONFIG.height
  const yAxisWidth = isMobile ? 70 : 80
  const leftMargin = isMobile ? 10 : 20
  const rightMargin = isMobile ? 10 : 20

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: leftMargin, right: rightMargin }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" domain={[0, CHART_CONFIG.maxValue]} />
          <YAxis
            type="category"
            dataKey="trait"
            width={yAxisWidth}
            tick={{ fontSize: isMobile ? 11 : 12 }}
          />
          <Tooltip />
          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={perfume.primaryColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
