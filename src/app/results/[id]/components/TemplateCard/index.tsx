'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Home, Share2 } from 'lucide-react'
import dynamic from 'next/dynamic'

import { StatBars } from '../StatBars'
import { serifFont } from '@/lib/constants/styles'
import type { PerfumeRecommendation } from '@/app/api/analyze-image/types'
import type { TraitScores } from '@/types/analysis'
import { useTranslation } from '@/i18n/useTranslation'
import {
  getMoodColorByCategory,
  getMoodTextColorByCategory,
  getMoodColorFallback,
  getMoodTextColorFallback,
} from '@/i18n/helpers/moodColors'
import { useLocalizedPerfume } from '@/i18n/helpers/localizedPerfume'
import { ASSETS, ACTIONS } from './constants'

const EnvelopeCard = dynamic(
  () => import('@/components/animations/PerfumeBottle').then(m => ({ default: m.EnvelopeCard })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full animate-pulse" style={{
          aspectRatio: '1',
          borderRadius: 12,
          backgroundColor: '#EDE9E1',
        }} />
      </div>
    ),
  }
)

// Auto font-size (same pattern as PerfumeDetailModal getStoryFontSize)
function fitFontSize(
  text: string,
  boxWidth: number,
  boxHeight: number,
  maxFont: number,
  minFont: number,
): number {
  if (!text) return maxFont
  // CJK / Thai 등 전각·넓은 문자 비율에 따라 글자 폭 계수 조정
  const wideChars = (text.match(/[\u2E80-\u9FFF\uF900-\uFAFF\u0E00-\u0E7F\uAC00-\uD7AF]/g) || []).length
  const wideRatio = wideChars / text.length
  const charWidth = 0.55 + wideRatio * 0.45 // 전각 100%일 때 ~1.0, 라틴 100%일 때 ~0.55
  for (let size = maxFont; size >= minFont; size--) {
    const charsPerLine = Math.floor(boxWidth / (size * charWidth))
    const lineCount = Math.ceil(text.length / charsPerLine)
    const totalHeight = lineCount * size * 1.5
    if (totalHeight <= boxHeight) return size
  }
  return minFont
}


const boxStyle: React.CSSProperties = {
  border: '2px solid #333',
  borderRadius: 16,
  backgroundColor: '#FFFDF8',
  boxShadow: '3px 3px 0px #333',
}

interface TemplateCardProps {
  analysis: {
    description: string
    traits: TraitScores
    personality: string
    mood?: string[]
    moodCategories?: string[]
  }
  recommendations: PerfumeRecommendation[]
  uploadedImage?: string
  timestamp?: number
  onShareOpen: () => void
  onHomeClick: () => void
}

export function TemplateCard({
  analysis,
  recommendations,
  uploadedImage,
  timestamp,
  onShareOpen,
  onHomeClick,
}: TemplateCardProps) {
  const { t: scentHint } = useTranslation('scentHints')
  const { t } = useTranslation('results')
  const { getName: getPerfumeName } = useLocalizedPerfume()
  const [openedBoxes, setOpenedBoxes] = useState<boolean[]>([false, false, false])
  const [imgPosition, setImgPosition] = useState<string>('center')

  // 항상 상단 유지, 하단 크롭
  useEffect(() => {
    if (!uploadedImage) return
    setImgPosition('top center')
  }, [uploadedImage])

  // ref 기반 동적 폰트 사이즈 계산
  const storyBoxRef = useRef<HTMLDivElement>(null)
  const [storyFontSize, setStoryFontSize] = useState('1.6dvh')

  const updateStoryFont = useCallback(() => {
    const el = storyBoxRef.current
    if (!el || !analysis.personality) return
    // clientWidth/Height는 padding 포함, border 제외 → padding 빼서 텍스트 영역 산출
    const w = el.clientWidth - 20  // padding 10*2
    const h = el.clientHeight - 16 // padding 8*2
    if (w <= 0 || h <= 0) return
    const px = fitFontSize(analysis.personality, w, h, 22, 10)
    setStoryFontSize(`${px}px`)
  }, [analysis.personality])

  useEffect(() => {
    updateStoryFont()
    const el = storyBoxRef.current
    if (!el) return
    const ro = new ResizeObserver(updateStoryFont)
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateStoryFont])

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      style={{
        width: '100%',
        height: '100dvh',
        backgroundColor: '#F5F0E8',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Logo — ~8% */}
      <div style={{
        flex: '0 0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2dvh 16px 3.5dvh',
      }}>
        <img
          src="/images/logo2.PNG"
          alt="AC'SCENT"
          style={{ height: '4dvh', objectFit: 'contain', filter: 'invert(1)' }}
        />
      </div>

      {/* Two-column area */}
      <div style={{
        flex: '38 1 0',
        display: 'flex',
        gap: 10,
        minHeight: 0,
        minWidth: 0,
        padding: '0 16px',
      }}>

        {/* Left: Polaroid photo frame — 45:55 ratio */}
        <div
          style={{
            flex: '55 0 0',
            minWidth: 0,
            border: '2px solid #333',
            borderRadius: 16,
            padding: 6,
            backgroundColor: '#FFFDF8',
            boxShadow: '3px 3px 0px #333',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Inner frame — 컨테이너 잔여 공간 기반 */}
          <div
            style={{
              width: '100%',
              flex: '4 1 0',
              minHeight: 0,
              borderRadius: 10,
              overflow: 'hidden',
              backgroundColor: '#f0f0f0',
            }}
          >
            {uploadedImage ? (
              <img
                src={uploadedImage}
                alt="분석한 이미지"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: imgPosition,
                  display: 'block',
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 12, color: '#bbb' }}>PHOTO</span>
              </div>
            )}
          </div>
          {/* Polaroid bottom strip — 플로팅 해시태그 */}
          <div style={{
            flex: '1 0 0',
            minHeight: '3.5dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            position: 'relative',
            zIndex: 10,
          }}>
            {(analysis.mood ?? []).slice(0, 2).map((keyword, i) => {
              const rotations = [-2.5, 1.5]
              const offsets = [-1, 2]
              const category = analysis.moodCategories?.[i]
              const bgColor = category ? getMoodColorByCategory(category) : getMoodColorFallback(keyword)
              const textColor = category ? getMoodTextColorByCategory(category) : getMoodTextColorFallback(keyword)
              return (
                <span
                  key={i}
                  style={{
                    fontSize: 'clamp(9px, 2.8vw, 13px)',
                    color: textColor,
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                    backgroundColor: bgColor,
                    border: '1.5px solid #333',
                    borderRadius: 999,
                    padding: '3px clamp(6px, 2vw, 12px)',
                    boxShadow: '1.5px 1.5px 0px #333',
                    transform: `rotate(${rotations[i]}deg) translateY(${offsets[i]}px)`,
                  }}
                >
                  #{keyword.length > 6 ? keyword.slice(0, 6) + '..' : keyword}
                </span>
              )
            })}
          </div>
        </div>

        {/* Right column — Image Story (전체) */}
        <div style={{ flex: '45 0 0', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <img
            src={ASSETS.story}
            alt="Image Story"
            style={{ height: '3.4dvh', objectFit: 'contain', alignSelf: 'center', marginBottom: '0.5dvh' }}
          />
          <div
            ref={storyBoxRef}
            style={{
              ...boxStyle,
              flex: 1,
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <p
              style={{
                fontSize: storyFontSize,
                lineHeight: 1.5,
                color: '#333',
                margin: 0,
                textAlign: 'center',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                width: '100%',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {analysis.personality}
            </p>
          </div>
        </div>
      </div>

      {/* Image Profile section */}
      <div style={{
        flex: '14 0 0',
        display: 'flex',
        flexDirection: 'column',
        marginTop: '1dvh',
        minHeight: 0,
        padding: '0 16px',
      }}>
        <img
          src={ASSETS.profile}
          alt="Image Profile"
          style={{ height: '3.4dvh', objectFit: 'contain', alignSelf: 'center', marginBottom: '0.5dvh', flexShrink: 0 }}
        />
        <div
          style={{
            ...boxStyle,
            flex: 1,
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <StatBars traits={analysis.traits} />
        </div>
      </div>

      {/* Recommendations section */}
      <div style={{
        flex: '25.5 1 0',
        display: 'flex',
        flexDirection: 'column',
        marginTop: '1dvh',
        minHeight: 0,
        padding: '0 16px',
      }}>
        <img
          src={ASSETS.reco}
          alt="Recommendations"
          style={{ height: '2.5dvh', objectFit: 'contain', alignSelf: 'center', marginBottom: '0.5dvh', flexShrink: 0 }}
        />
        <div
          style={{
            ...boxStyle,
            flex: 1,
            padding: '8px 10px 6px',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <p style={{
            fontSize: '1.95dvh',
            color: '#333',
            textAlign: 'center',
            margin: '0 0 0.5dvh',
            flexShrink: 0,
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.03em',
          }}>
            {t('templateCard.checkReply')}
          </p>
          <div
            style={{
              flex: 1,
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
              alignItems: 'flex-end',
              minHeight: 0,
            }}
          >
            {recommendations.slice(0, 3).map((rec, idx) => (
              <EnvelopeCard
                key={idx}
                perfumeName={getPerfumeName(rec.perfume.id)}
                index={idx}
                recommendation={rec}
                hint={scentHint(rec.perfume.id)}
                uploadedImage={uploadedImage}
                analysisDate={timestamp}
                onOpen={() => {
                  setOpenedBoxes(prev => {
                    const next = [...prev]
                    next[idx] = true
                    return next
                  })
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          flex: '0 0 auto',
          display: 'flex',
          justifyContent: 'center',
          gap: ACTIONS.gap,
          padding: '1dvh 16px',
        }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onShareOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 20px',
            height: '4.5dvh',
            borderRadius: 20,
            backgroundColor: '#BB0000',
            border: '2px solid #333',
            color: '#fff',
            fontSize: 12,
            cursor: 'pointer',
            boxShadow: '3px 3px 0px #333',
            ...serifFont,
          }}
        >
          <Share2 size={14} />
          <span>SHARE</span>
        </motion.button>
        <button
          onClick={onHomeClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 20px',
            height: '4.5dvh',
            borderRadius: 20,
            backgroundColor: '#FFFDF8',
            border: '2px solid #333',
            color: '#333',
            fontSize: 12,
            cursor: 'pointer',
            boxShadow: '3px 3px 0px #333',
            ...serifFont,
          }}
        >
          <Home size={14} />
          <span>HOME</span>
        </button>
      </div>

      {/* Footer */}
      <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', paddingBottom: '1.5dvh' }}>
        <img
          src={ASSETS.footer}
          alt="Ac'scent wow"
          style={{ height: '1.3dvh', objectFit: 'contain', opacity: 0.6 }}
        />
      </div>
    </motion.div>
  )
}
