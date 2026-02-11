import { Perfume } from '@/lib/data/perfumes'

export interface TraitsChartProps {
  perfume: Perfume
}

export interface ChartDataPoint {
  trait: string
  value: number
}
