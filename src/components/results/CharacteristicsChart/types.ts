import { Perfume } from '@/lib/data/perfumes'

export interface CharacteristicsChartProps {
  perfume: Perfume
}

export interface ChartDataPoint {
  characteristic: string
  value: number
  fullMark: number
}
