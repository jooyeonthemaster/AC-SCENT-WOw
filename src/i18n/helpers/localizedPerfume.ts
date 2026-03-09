'use client'

import { useTranslation } from '@/i18n/useTranslation'

/**
 * 향수 데이터 로컬라이즈 훅
 * perfumes.json에서 향수 ID로 번역된 필드를 조회
 */
export function useLocalizedPerfume() {
  const { t, tArray } = useTranslation('perfumes')

  return {
    getName: (id: string) => t(`${id}.name`),
    getMainScent: (id: string) => t(`${id}.mainScent`),
    getSubScent1: (id: string) => t(`${id}.subScent1`),
    getSubScent2: (id: string) => t(`${id}.subScent2`),
    getKeywords: (id: string) => tArray(`${id}.keywords`),
  }
}
