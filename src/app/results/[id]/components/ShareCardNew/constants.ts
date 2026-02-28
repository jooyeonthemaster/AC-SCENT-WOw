import type { TraitScores, ScentCategoryScores } from '@/types/analysis'

// 한글 라벨 (순서: 귀여움, 섹시함, 럭셔리, 순수함, 자유로움, 카리스마, 다크함, 우아함, 청량함, 독특함)
export const TRAIT_KO_LABELS = [
  '귀여움', '섹시함', '럭셔리', '순수함', '자유로움',
  '카리스마', '다크함', '우아함', '청량함', '독특함'
]

export const TRAIT_ORDER: (keyof TraitScores)[] = [
  'cute', 'sexy', 'luxury', 'purity', 'freedom',
  'charisma', 'darkness', 'elegance', 'freshness', 'uniqueness'
]

export const SCENT_ORDER: (keyof ScentCategoryScores)[] = [
  'citrus', 'floral', 'woody', 'musky', 'fruity', 'spicy'
]
