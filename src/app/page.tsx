'use client'

import { WritingStep } from '@/components/letter/WritingStep'
import { DynamicBackground } from '@/components/DynamicBackground'
import { LanguageSelect } from '@/components/LanguageSelect'
import { useLocale } from '@/i18n/context'

export default function HomePage() {
  const { isLocaleSelected, isLoading } = useLocale()

  // localStorage 읽기 전 빈 화면 (깜빡임 방지)
  if (isLoading) {
    return <div style={{ height: '100dvh', backgroundColor: '#F5F0E8' }} />
  }

  // 첫 방문: 언어 선택 화면
  if (!isLocaleSelected) {
    return <LanguageSelect />
  }

  return (
    <div
      style={{
        position: 'relative',
        height: '100dvh',
        overflow: 'hidden',
      }}
    >
      <DynamicBackground />
      <div style={{ position: 'relative', zIndex: 10, height: '100%' }}>
        <WritingStep />
      </div>
    </div>
  )
}
