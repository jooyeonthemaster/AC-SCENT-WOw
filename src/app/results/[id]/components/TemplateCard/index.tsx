'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Home, Share2 } from 'lucide-react'
import dynamic from 'next/dynamic'

import { StatBars } from '../StatBars'
import { serifFont } from '@/lib/constants/styles'
import type { PerfumeRecommendation } from '@/app/api/analyze-image/types'
import type { TraitScores } from '@/types/analysis'

import { ASSETS, ACTIONS } from './constants'

const EnvelopeCard = dynamic(
  () => import('@/components/animations/PerfumeBottle').then(m => ({ default: m.EnvelopeCard })),
  { ssr: false }
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
  for (let size = maxFont; size >= minFont; size--) {
    const charsPerLine = Math.floor(boxWidth / (size * 0.55))
    const lineCount = Math.ceil(text.length / charsPerLine)
    const totalHeight = lineCount * size * 1.5
    if (totalHeight <= boxHeight) return size
  }
  return minFont
}

// 빈도 높은 mood 키워드 → 이모지 매핑
const MOOD_EMOJI: Record<string, string> = {
  시크: '🖤', 쿨: '🧊', 청량: '💎', 따뜻: '🔥', 몽환: '🌙',
  우아: '🦢', 신비: '✨', 화사: '🌸', 세련: '💫', 감성: '🎭',
  로맨틱: '💕', 포근: '☁️', 순수: '🤍', 열정: '❤️‍🔥', 여유: '🍃',
  다크: '🖤', 도시: '🏙️', 빈티지: '📷', 밝은: '☀️', 자유: '🕊️',
  카리스마: '⚡', 섹시: '💋', 귀여운: '🎀', 상큼: '🍊', 깔끔: '🫧',
  고급: '👑', 편안: '🛋️', 차분: '🌊', 활발: '🎉', 부드러운: '🧸',
}

function getMoodEmoji(keyword: string): string {
  for (const [key, emoji] of Object.entries(MOOD_EMOJI)) {
    if (keyword.includes(key)) return emoji
  }
  return ''
}

const boxStyle: React.CSSProperties = {
  border: '1px solid #333',
  borderRadius: 4,
  backgroundColor: '#fff',
}

interface TemplateCardProps {
  analysis: {
    description: string
    traits: TraitScores
    personality: string
    mood?: string[]
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
  const [openedBoxes, setOpenedBoxes] = useState<boolean[]>([false, false, false])
  const [imgPosition, setImgPosition] = useState<string>('center')

  // 이미지 비율 감지 → 크롭 방향 결정
  useEffect(() => {
    if (!uploadedImage) return
    const img = new window.Image()
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight
      if (ratio < 0.75) {
        // 세로로 긴 이미지 → 위쪽 유지, 아래 크롭
        setImgPosition('top center')
      } else {
        // 가로로 긴 이미지 또는 3:4 → 좌우 균등 크롭
        setImgPosition('center center')
      }
    }
    img.src = uploadedImage
  }, [uploadedImage])

  // 1.5배 키운 px 값 → dvh 변환 (기준 뷰포트 850px)
  const storyFontPx = fitFontSize(analysis.personality, 160, 100, 27, 14)
  const storyFontSize = `${(storyFontPx / 850 * 100).toFixed(2)}dvh`

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      style={{
        width: '100%',
        height: '100dvh',
        backgroundColor: '#fff',
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
          src={ASSETS.logo}
          alt="Ac'scent"
          style={{ height: '8dvh', objectFit: 'contain' }}
        />
      </div>

      {/* Two-column area — ~40% */}
      <div style={{
        flex: '40 1 0',
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
            borderRadius: 4,
            padding: 6,
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Inner frame — 3:4 비율 */}
          <div
            style={{
              width: '100%',
              aspectRatio: '3/4',
              border: '1px solid #333',
              borderRadius: 2,
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
                  aspectRatio: '3/4',
                  objectFit: 'cover',
                  objectPosition: imgPosition,
                  display: 'block',
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                aspectRatio: '3/4',
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
            height: '3dvh',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 6,
            paddingTop: '1.2dvh',
            position: 'relative',
            zIndex: 10,
          }}>
            {(analysis.mood ?? []).slice(0, 2).map((keyword, i) => {
              const rotations = [-2.5, 1.5]
              const offsets = [-1, 2]
              return (
                <span
                  key={i}
                  style={{
                    fontSize: '1.4dvh',
                    color: '#333',
                    fontFamily: '"Poppins", "Noto Sans KR", sans-serif',
                    fontWeight: 500,
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                    border: '1px solid #BB0000',
                    borderRadius: 999,
                    padding: '0.25dvh 0.8dvh',
                    transform: `rotate(${rotations[i]}deg) translateY(${offsets[i]}px)`,
                  }}
                >
                  {getMoodEmoji(keyword) ? `${getMoodEmoji(keyword)} #` : '#'}{keyword}
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
                wordBreak: 'keep-all',
                fontFamily: '"Poppins", "Noto Sans KR", sans-serif',
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
        flex: '28 1 0',
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
            fontSize: '1.3dvh',
            color: '#333',
            textAlign: 'center',
            margin: '0 0 0.5dvh',
            flexShrink: 0,
            fontFamily: '"Poppins", "Noto Sans KR", sans-serif',
            letterSpacing: '0.03em',
          }}>
            편지를 눌러서 답장을 확인해보세요 💌
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
                perfumeName={rec.perfume.name}
                index={idx}
                recommendation={rec}
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
          <p
            style={{
              fontSize: '1.9dvh',
              letterSpacing: '0.15em',
              color: '#AAA',
              textAlign: 'center',
              margin: '4px 0 0',
              flexShrink: 0,
              ...serifFont,
            }}
          >
            {openedBoxes.filter(Boolean).length} / {Math.min(recommendations.length, 3)} REVEALED
          </p>
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
            backgroundColor: '#fff',
            border: '2px solid #BB0000',
            color: '#BB0000',
            fontSize: 12,
            cursor: 'pointer',
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
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            color: '#555',
            fontSize: 12,
            cursor: 'pointer',
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
