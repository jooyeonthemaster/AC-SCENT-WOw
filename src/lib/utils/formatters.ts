// Text formatting utilities
import { TRAIT_LABELS, CHARACTERISTIC_LABELS } from '@/lib/constants/labels'

export function formatScore(score: number): string {
  return score.toFixed(1)
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function formatTraitName(trait: string): string {
  return TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS] || trait
}

export function formatCharacteristicName(characteristic: string): string {
  return CHARACTERISTIC_LABELS[characteristic as keyof typeof CHARACTERISTIC_LABELS] || characteristic
}
