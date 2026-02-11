// 중앙 라벨 저장소
// 모든 라벨 상수를 이 파일에서 관리합니다.

import type { TraitScores, ScentCategoryScores } from '@/types/analysis'

/**
 * 특성(Trait) 한글 라벨
 */
export const TRAIT_LABELS: Record<keyof TraitScores, string> = {
  sexy: '섹시함',
  cute: '귀여움',
  charisma: '카리스마',
  darkness: '신비로움',
  freshness: '상쾌함',
  elegance: '우아함',
  freedom: '자유로움',
  luxury: '고급스러움',
  purity: '순수함',
  uniqueness: '독특함',
}

/**
 * 향 카테고리 한글 라벨
 */
export const CHARACTERISTIC_LABELS: Record<keyof ScentCategoryScores, string> = {
  citrus: '시트러스',
  floral: '플로럴',
  woody: '우디',
  musky: '머스크',
  fruity: '프루티',
  spicy: '스파이시',
}
