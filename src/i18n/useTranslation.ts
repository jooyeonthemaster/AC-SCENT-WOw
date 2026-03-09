'use client'

import { useCallback } from 'react'
import { useLocale } from './context'
import type { TranslationNamespace } from './types'

/**
 * 번역 훅
 * @param namespace - JSON 파일 이름 (common, home, results 등)
 * @returns t() 함수 — 키로 번역 문자열 조회
 *
 * 사용 예시:
 *   const { t } = useTranslation('common')
 *   t('buttons.share')         → "공유"
 *   t('errors.fileTooLarge', { maxSize: 10 })  → "이미지 크기는 10MB 이하여야 합니다"
 */
export function useTranslation(namespace: TranslationNamespace) {
  const { messages } = useLocale()

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const nsMessages = messages[namespace]
      if (!nsMessages) return key

      // 중첩 키 지원: 'buttons.share' → messages.buttons.share
      const parts = key.split('.')
      let value: unknown = nsMessages
      for (const part of parts) {
        if (value == null || typeof value !== 'object') return key
        value = (value as Record<string, unknown>)[part]
      }

      if (typeof value !== 'string') return key

      // 템플릿 파라미터 치환: "크기는 {maxSize}MB" → "크기는 10MB"
      if (params) {
        return value.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`))
      }

      return value
    },
    [messages, namespace],
  )

  /**
   * 배열 번역 조회 (예: analyzingMessages)
   */
  const tArray = useCallback(
    (key: string): string[] => {
      const nsMessages = messages[namespace]
      if (!nsMessages) return []

      const parts = key.split('.')
      let value: unknown = nsMessages
      for (const part of parts) {
        if (value == null || typeof value !== 'object') return []
        value = (value as Record<string, unknown>)[part]
      }

      if (Array.isArray(value)) return value.filter(v => typeof v === 'string')
      return []
    },
    [messages, namespace],
  )

  return { t, tArray }
}
