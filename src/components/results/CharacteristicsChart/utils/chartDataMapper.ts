import { Perfume } from '@/lib/data/perfumes'
import { CHARACTERISTIC_LABELS } from '../constants'
import type { ChartDataPoint } from '../types'

export function mapCharacteristicsToChartData(
  perfume: Perfume
): ChartDataPoint[] {
  return Object.entries(perfume.characteristics).map(([key, value]) => ({
    characteristic: CHARACTERISTIC_LABELS[key as keyof typeof CHARACTERISTIC_LABELS] || key,
    value,
    fullMark: 10,
  }))
}
