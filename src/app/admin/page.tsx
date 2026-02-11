'use client'

import { useEffect, useState } from 'react'
import { perfumes } from '@/lib/data/perfumes'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'
import { RefreshCw, Trash2 } from 'lucide-react'

interface PerfumeStat {
  perfumeId: string
  count: number
}

interface ChartData {
  name: string
  id: string
  shortId: string
  count: number
}

export default function AdminPage() {
  const [data, setData] = useState<ChartData[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stats')
      const result = await response.json()

      if (result.success) {
        const stats: PerfumeStat[] = result.data.stats
        const statsMap = new Map(stats.map(s => [s.perfumeId, s.count]))

        // Create data for ALL 30 perfumes, sorted by ID
        const formattedData = perfumes.map(perfume => {
          return {
            name: perfume.name,
            id: perfume.id,
            shortId: perfume.id.replace("AC'SCENT ", ""),
            count: statsMap.get(perfume.id) || 0,
          }
        }).sort((a, b) => {
          // Sort by ID number (AC'SCENT 01 -> 1)
          const idA = parseInt(a.shortId)
          const idB = parseInt(b.shortId)
          return idA - idB
        })

        setData(formattedData)
        setTotalCount(result.data.total)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetStats = async () => {
    if (!confirm('정말로 모든 데이터를 초기화하시겠습니까?')) return
    try {
      await fetch('/api/stats', { method: 'DELETE' })
      await fetchStats()
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  // Calculate dynamic height based on number of items (30 items * 40px per item + padding)
  // Ensure minimum height
  const chartHeight = Math.max(800, data.length * 40)

  return (
    <div className="min-h-screen bg-white font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-gray-100 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              AC'SCENT STATISTICS
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              전체 향수 추천 현황 (Total: {Math.floor(totalCount / 3).toLocaleString()} Analysis)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
            <button
              onClick={resetStats}
              className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-red-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              초기화
            </button>
          </div>
        </header>

        {/* Main Chart Area */}
        <div className="w-full bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
              barCategoryGap={10}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                domain={[0, 'auto']}
                allowDecimals={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                width={120}
                tick={({ x, y, payload }) => {
                  const item = data.find(d => d.name === payload.value)
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={-16} y={-4} dy={4} textAnchor="end" fill="#111827" fontSize={13} fontWeight={600}>
                        {payload.value}
                      </text>
                      <text x={-16} y={12} dy={4} textAnchor="end" fill="#9ca3af" fontSize={11} fontFamily="monospace">
                        ID {item?.shortId}
                      </text>
                    </g>
                  )
                }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                formatter={(value: any) => [`${value}회`, '추천 수']}
              />
              <Bar
                dataKey="count"
                fill="#111827"
                radius={[0, 4, 4, 0]}
                barSize={16}
                animationDuration={1000}
                label={{ position: 'right', fill: '#6b7280', fontSize: 12, formatter: (val: any) => val > 0 ? `${val}회` : '' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
