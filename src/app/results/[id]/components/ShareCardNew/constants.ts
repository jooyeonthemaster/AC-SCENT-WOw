import type { ScentCategoryScores } from '@/types/analysis'

export const SCENT_ORDER: (keyof ScentCategoryScores)[] = [
  'citrus', 'floral', 'woody', 'musky', 'fruity', 'spicy'
]
