'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useLocale } from '@/i18n/context'
import { LOCALES } from '@/i18n/config'
import type { Locale } from '@/i18n/types'

export function LanguageSelect() {
  const { setLocale } = useLocale()

  const handleSelect = (code: Locale) => {
    setLocale(code)
  }

  return (
    <div
      className="relative w-full flex flex-col"
      style={{ height: '100dvh', overflow: 'hidden', backgroundColor: '#F5F0E8' }}
    >
      {/* WritingStep과 동일한 내부 레이아웃 */}
      <div
        className="flex-1 flex flex-col items-center px-6 pt-14 pb-8"
        style={{ minHeight: 0, overflow: 'hidden' }}
      >
        {/* 헤더 로고 — WritingStep과 완전 동일 */}
        <div className="text-center" style={{ marginTop: 'calc(env(safe-area-inset-top, 0px) + 24px)', flexShrink: 0 }}>
          <Image
            src="/images/logo2.PNG"
            alt="AC'SCENT"
            width={240}
            height={60}
            style={{
              filter: 'invert(1)',
              objectFit: 'contain',
              height: 'clamp(29px, 7.2vw, 38px)',
              width: 'auto',
            }}
            priority
          />
        </div>

        {/* 본문: WritingStep 변동 영역과 동일 패턴 */}
        <div className="flex-1 flex flex-col items-center justify-center w-full" style={{ minHeight: 0 }}>
          {/* 안내 텍스트 */}
          <p
            style={{
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              color: '#666',
              textAlign: 'center',
              marginBottom: 24,
              fontFamily: 'var(--font-sans)',
            }}
          >
            Select Language / 언어를 선택하세요
          </p>

          {/* 언어 버튼 목록 */}
          <div
            style={{
              width: '100%',
              maxWidth: 320,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {LOCALES.map((loc, i) => (
              <motion.button
                key={loc.code}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', damping: 20, stiffness: 200 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelect(loc.code)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 14,
                  backgroundColor: '#FFFDF8',
                  border: '2px solid #333',
                  boxShadow: '3px 3px 0px #333',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <span style={{ fontSize: 22 }}>{loc.flag}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>
                  {loc.nativeLabel}
                </span>
                {loc.code !== 'ko' && loc.code !== 'en' && (
                  <span style={{ fontSize: 12, color: '#999', marginLeft: 'auto' }}>
                    {loc.label}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
