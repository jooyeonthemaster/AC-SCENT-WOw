"use client"

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft, Check } from 'lucide-react'
import type { PerfumeRecommendation } from '@/app/api/analyze-image/types'
import type { Perfume } from '@/lib/data/perfumes'
import { perfumes } from '@/lib/data/perfumes'
import { getAccentColor } from '@/lib/utils/envelopeColor'
import { useTranslation } from '@/i18n/useTranslation'
import { useLocalizedPerfume } from '@/i18n/helpers/localizedPerfume'

interface PerfumeSelectModalProps {
  isOpen: boolean
  onClose: () => void
  recommendations: PerfumeRecommendation[]
  onSelect: (perfume: Perfume) => void
}

const boxStyle: React.CSSProperties = {
  border: '2px solid #333',
  borderRadius: 16,
  backgroundColor: '#FFFDF8',
  boxShadow: '3px 3px 0px #333',
}

export function PerfumeSelectModal({
  isOpen,
  onClose,
  recommendations,
  onSelect,
}: PerfumeSelectModalProps) {
  const { t } = useTranslation('results')
  const { getName: getPerfumeName } = useLocalizedPerfume()
  const [showAllPerfumes, setShowAllPerfumes] = useState(false)

  const handleClose = () => {
    setShowAllPerfumes(false)
    onClose()
  }

  const handleSelect = (perfume: Perfume) => {
    setShowAllPerfumes(false)
    onSelect(perfume)
  }

  const handleBack = () => {
    setShowAllPerfumes(false)
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 블러 */}
          <motion.div
            key="perfume-select-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(245, 240, 232, 0.6)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              zIndex: 99990,
            }}
          />

          {/* 모달 래퍼 */}
          <motion.div
            key="perfume-select-wrapper"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99991,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              padding: '24px 30px',
            }}
          >
            {/* 모달 컨테이너 */}
            <div
              style={{
                ...boxStyle,
                width: '100%',
                maxWidth: 380,
                maxHeight: 'calc(100dvh - 120px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '24px 20px 20px',
                pointerEvents: 'auto',
                boxShadow: '5px 5px 0px #333',
              }}
            >
              <AnimatePresence mode="wait">
                {!showAllPerfumes ? (
                  /* ── 추천 향수 선택 화면 ── */
                  <motion.div
                    key="recommend"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15 }}
                  >
                    <h2
                      style={{
                        textAlign: 'center',
                        fontSize: 20,
                        fontWeight: 700,
                        color: '#333',
                        fontFamily: 'var(--font-sans)',
                        margin: 0,
                        marginBottom: 4,
                      }}
                    >
                      {t('selectPerfume.title')}
                    </h2>
                    <p
                      style={{
                        textAlign: 'center',
                        fontSize: 13,
                        color: '#888',
                        margin: 0,
                        marginBottom: 20,
                      }}
                    >
                      {t('selectPerfume.subtitle')}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {recommendations.slice(0, 3).map((rec) => {
                        // 향 번호 추출 (AC'SCENT 13 → 13)
                        const numMatch = rec.perfume.id.match(/\d+/)
                        const perfumeNum = numMatch ? `#${numMatch[0]}` : rec.perfume.id

                        return (
                          <button
                            key={rec.perfume.id}
                            onClick={() => handleSelect(rec.perfume)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '14px 16px',
                              borderRadius: 14,
                              backgroundColor: '#FFFDF8',
                              border: '2px solid #333',
                              boxShadow: '3px 3px 0px #333',
                              cursor: 'pointer',
                              fontFamily: 'var(--font-sans)',
                              transition: 'transform 0.1s',
                            }}
                          >
                            {/* 향 번호 뱃지 (향수 고유 색상) */}
                            <span
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                backgroundColor: getAccentColor(rec.perfume.primaryColor) || '#666',
                                border: '1.5px solid #333',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: 12,
                                fontWeight: 800,
                                flexShrink: 0,
                                letterSpacing: '-0.02em',
                              }}
                            >
                              {perfumeNum}
                            </span>
                            {/* 향수 이름 */}
                            <p style={{ fontSize: 17, fontWeight: 700, color: '#333', margin: 0, textAlign: 'left', flex: 1 }}>
                              {getPerfumeName(rec.perfume.id)}
                            </p>
                            <Check size={16} color="#ccc" />
                          </button>
                        )
                      })}

                      {/* 다른 향수 선택 */}
                      <button
                        onClick={() => setShowAllPerfumes(true)}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          borderRadius: 14,
                          backgroundColor: '#F5F0E8',
                          border: '2px dashed #999',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-sans)',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#666',
                          transition: 'transform 0.1s',
                        }}
                      >
                        {t('selectPerfume.otherPerfume')}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* ── 전체 향수 목록 화면 ── */
                  <motion.div
                    key="all-perfumes"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* 뒤로가기 + 헤더 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <button
                        onClick={handleBack}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: '#FFFDF8',
                          border: '2px solid #333',
                          boxShadow: '2px 2px 0px #333',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        <ArrowLeft size={14} color="#333" />
                      </button>
                      <h2
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: '#333',
                          fontFamily: 'var(--font-sans)',
                          margin: 0,
                        }}
                      >
                        {t('selectPerfume.allPerfumesTitle')}
                      </h2>
                    </div>

                    {/* 30개 그리드 */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 8,
                        maxHeight: 'calc(100dvh - 260px)',
                        overflowY: 'auto',
                        paddingRight: 4,
                      }}
                    >
                      {perfumes.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSelect(p)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 10,
                            backgroundColor: '#FFFDF8',
                            border: '1.5px solid #333',
                            boxShadow: '2px 2px 0px #333',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-sans)',
                            textAlign: 'left',
                          }}
                        >
                          <p style={{ fontSize: 10, color: '#999', margin: 0, fontWeight: 600 }}>
                            {p.id}
                          </p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#333', margin: 0, marginTop: 2 }}>
                            {getPerfumeName(p.id)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#FFFDF8',
                border: '2px solid #333',
                boxShadow: '3px 3px 0px #333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                pointerEvents: 'auto',
                marginTop: 16,
                flexShrink: 0,
              }}
            >
              <X size={20} color="#333" />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
