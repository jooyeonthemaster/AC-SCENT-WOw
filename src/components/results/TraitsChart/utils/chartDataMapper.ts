import { Perfume } from '@/lib/data/perfumes'
import { TRAIT_LABELS } from '../constants'
import type { ChartDataPoint } from '../types'

export function mapTraitsToChartData(perfume: Perfume): ChartDataPoint[] {
  // Convert traits object to array and sort by value descending
  const traitsArray = Object.entries(perfume.traits).map(([key, value]) => ({
    trait: TRAIT_LABELS[key as keyof typeof TRAIT_LABELS] || key,
    value,
  }))

  // Sort by value descending
  traitsArray.sort((a, b) => b.value - a.value)

  return traitsArray
}
