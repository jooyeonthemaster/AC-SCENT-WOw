'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { mapTraitsToChartData } from './utils/chartDataMapper'
import { CHART_CONFIG } from './constants'
import type { TraitsChartProps } from './types'

const TOP_TRAIT_COUNT = 3
const COLOR_ACCENT = '#BB0000'
const COLOR_DEFAULT = '#1A1A1A'

export function TraitsChart({ perfume }: TraitsChartProps) {
  const isMobile = true

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
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#EEEEEE"
            horizontal={true}
            vertical={false}
          />
          <XAxis
            type="number"
            domain={[0, CHART_CONFIG.maxValue]}
            tick={{ fill: '#999', fontSize: isMobile ? 10 : 11 }}
            axisLine={{ stroke: '#EEE' }}
            tickLine={{ stroke: '#EEE' }}
          />
          <YAxis
            type="category"
            dataKey="trait"
            width={yAxisWidth}
            tick={{ fill: '#333', fontSize: isMobile ? 11 : 12, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="value" radius={[0, 3, 3, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index < TOP_TRAIT_COUNT ? COLOR_ACCENT : COLOR_DEFAULT}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
